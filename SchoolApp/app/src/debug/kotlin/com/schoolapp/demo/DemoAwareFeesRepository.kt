package com.schoolapp.demo

import com.schoolapp.core.common.result.AppError
import com.schoolapp.core.common.result.AppResult
import com.schoolapp.core.data.fees.DefaultFeesRepository
import com.schoolapp.core.data.fees.FeesRepository
import com.schoolapp.core.model.fees.DailyCollection
import com.schoolapp.core.model.fees.DuesRow
import com.schoolapp.core.model.fees.FeeSummary
import com.schoolapp.core.model.fees.FinanceOverview
import com.schoolapp.core.model.fees.Invoice
import com.schoolapp.core.model.fees.InvoicePayment
import com.schoolapp.core.model.fees.InvoiceStatus
import com.schoolapp.core.model.fees.Payment
import com.schoolapp.core.model.fees.PaymentInput
import com.schoolapp.core.model.fees.PaymentMethod
import com.schoolapp.core.model.fees.PaymentOutcome
import com.schoolapp.core.model.fees.PaymentProof
import com.schoolapp.core.model.fees.ProofInput
import com.schoolapp.core.model.fees.ProofMethod
import com.schoolapp.core.model.fees.ProofStatus
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.combine
import kotlinx.coroutines.flow.update
import java.util.concurrent.ConcurrentHashMap
import javax.inject.Inject
import javax.inject.Singleton

/** Demo fees: in-memory invoices, proofs, dues and collections; receipts and online payment are never faked. */
@Singleton
class DemoAwareFeesRepository @Inject constructor(
    private val real: DefaultFeesRepository,
    private val auth: DemoAwareAuthRepository,
) : FeesRepository {

    /** clientRequestId → recorded payment, so a retried send returns the same receipt. */
    private val recorded = ConcurrentHashMap<String, Payment>()

    override val queuedPayments: Flow<Int> = combine(auth.demoSession, real.queuedPayments) { demo, queued -> if (demo != null) 0 else queued }

    override suspend fun feeSummary(studentId: String): AppResult<FeeSummary> =
        if (auth.isDemoActive) AppResult.Success(DemoFeesData.summary(studentId)) else real.feeSummary(studentId)

    override suspend fun invoices(studentId: String?, status: InvoiceStatus?, branchId: String?): AppResult<List<Invoice>> {
        if (!auth.isDemoActive) return real.invoices(studentId, status, branchId)
        val list = DemoFeesData.invoices.value
            .filter { (studentId == null || it.studentId == studentId) && (status == null || it.status == status) }
            .sortedWith(compareByDescending<Invoice> { it.period.orEmpty() }.thenByDescending { it.dueDate.orEmpty() })
        return AppResult.Success(list)
    }

    override suspend fun invoice(id: String): AppResult<Invoice> {
        if (!auth.isDemoActive) return real.invoice(id)
        return DemoFeesData.invoices.value.firstOrNull { it.id == id }?.let { AppResult.Success(it) } ?: notFound()
    }

    override suspend fun receiptUrl(paymentId: String): AppResult<String> =
        if (auth.isDemoActive) AppResult.Failure(AppError.Server(HTTP_ACCEPTED, "FILE_NOT_READY", "Receipt is being prepared")) else real.receiptUrl(paymentId)

    override suspend fun submitProof(input: ProofInput): AppResult<PaymentProof> {
        if (!auth.isDemoActive) return real.submitProof(input)
        val invoice = DemoFeesData.invoices.value.firstOrNull { it.id == input.invoiceId } ?: return notFound()
        val proof = PaymentProof(
            id = DemoFeesData.nextId("proof"),
            invoiceId = invoice.id,
            invoiceNo = invoice.invoiceNo,
            studentName = invoice.studentName,
            amountMinor = input.amountMinor,
            paidOn = input.paidOn,
            method = input.method,
            reference = input.reference,
            fileUrl = null,
            fileMime = DemoFiles.uploaded[input.fileId]?.mime,
            status = ProofStatus.SUBMITTED,
            reason = null,
            submittedBy = DemoActors.forRole(auth.demoSession.value?.activeRole).name,
            createdAt = DemoDates.isoNow(),
        )
        DemoFeesData.proofs.update { listOf(proof) + it }
        return AppResult.Success(proof)
    }

    override suspend fun proofs(status: ProofStatus?, branchId: String?): AppResult<List<PaymentProof>> {
        if (!auth.isDemoActive) return real.proofs(status, branchId)
        return AppResult.Success(DemoFeesData.proofs.value.filter { status == null || it.status == status }.sortedByDescending { it.createdAt.orEmpty() })
    }

    override suspend fun verifyProof(id: String, note: String?): AppResult<PaymentProof> {
        if (!auth.isDemoActive) return real.verifyProof(id, note)
        val proof = DemoFeesData.proofs.value.firstOrNull { it.id == id } ?: return notFound()
        if (proof.status != ProofStatus.SUBMITTED) return conflict("This proof was already decided")
        val studentId = DemoFeesData.invoices.value.firstOrNull { it.id == proof.invoiceId }?.studentId
        if (studentId != null) {
            val payment = newPayment(studentId, proof.studentName, proof.amountMinor, proof.method.toPaymentMethod(), proof.reference, DemoDates.todayKey())
            DemoFeesData.allocate(studentId, proof.amountMinor, payment.toInvoicePayment(), proof.invoiceId)
            DemoFeesData.counterPayments.update { it + payment }
        }
        return decide(id, ProofStatus.VERIFIED, null)
    }

    override suspend fun rejectProof(id: String, reason: String): AppResult<PaymentProof> {
        if (!auth.isDemoActive) return real.rejectProof(id, reason)
        val proof = DemoFeesData.proofs.value.firstOrNull { it.id == id } ?: return notFound()
        if (proof.status != ProofStatus.SUBMITTED) return conflict("This proof was already decided")
        return decide(id, ProofStatus.REJECTED, reason.trim())
    }

    override suspend fun recordPayment(input: PaymentInput, clientRequestId: String): AppResult<PaymentOutcome> {
        if (!auth.isDemoActive) return real.recordPayment(input, clientRequestId)
        recorded[clientRequestId]?.let { return AppResult.Success(PaymentOutcome.Recorded(it)) }
        if (input.method == PaymentMethod.CASH && input.receivedOn in DemoFeesData.closedDates) {
            return AppResult.Failure(AppError.Server(HTTP_LOCKED, "DAY_CLOSED", "This day is already closed"))
        }
        val student = DemoFeesData.student(input.studentId)
        val payment = newPayment(input.studentId, student?.name, input.amountMinor, input.method, input.reference, input.receivedOn)
        if (!DemoFeesData.allocate(input.studentId, input.amountMinor, payment.toInvoicePayment())) {
            DemoFeesData.reduceOtherDues(input.studentId, input.amountMinor)
        }
        DemoFeesData.counterPayments.update { it + payment }
        recorded[clientRequestId] = payment
        return AppResult.Success(PaymentOutcome.Recorded(payment))
    }

    override suspend fun payOnline(invoiceId: String): AppResult<String> =
        if (auth.isDemoActive) conflict("Online payment is not enabled for this branch", "GATEWAY_DISABLED") else real.payOnline(invoiceId)

    override suspend fun dues(search: String?, branchId: String?): AppResult<List<DuesRow>> {
        if (!auth.isDemoActive) return real.dues(search, branchId)
        val query = search?.trim()?.lowercase().orEmpty()
        return AppResult.Success(
            DemoFeesData.dues().filter {
                query.isEmpty() || it.studentName.lowercase().contains(query) || it.admissionNo?.lowercase()?.contains(query) == true
            },
        )
    }

    override suspend fun dailyCollection(date: String, branchId: String?): AppResult<DailyCollection> =
        if (auth.isDemoActive) AppResult.Success(DemoFeesData.collection(date)) else real.dailyCollection(date, branchId)

    override suspend fun financeOverview(branchId: String?, month: String?): AppResult<FinanceOverview> =
        if (auth.isDemoActive) AppResult.Success(DemoFeesData.overview()) else real.financeOverview(branchId, month)

    private fun newPayment(studentId: String, name: String?, amount: Long, method: PaymentMethod, reference: String?, on: String) = Payment(
        id = DemoFeesData.nextId("pay"),
        receiptNo = DemoFeesData.nextReceipt(),
        studentId = studentId,
        studentName = name,
        amountMinor = amount,
        method = method,
        reference = reference,
        receivedOn = on,
        cashierName = DemoActors.forRole(auth.demoSession.value?.activeRole).name,
        status = "RECORDED",
    )

    private fun Payment.toInvoicePayment() = InvoicePayment(id, receiptNo, amountMinor, receivedOn)

    private fun ProofMethod.toPaymentMethod() = when (this) {
        ProofMethod.BANK, ProofMethod.OTHER -> PaymentMethod.BANK
        ProofMethod.WALLET -> PaymentMethod.ONLINE
    }

    private fun decide(id: String, status: ProofStatus, reason: String?): AppResult<PaymentProof> {
        DemoFeesData.proofs.update { list -> list.map { if (it.id == id) it.copy(status = status, reason = reason) else it } }
        return DemoFeesData.proofs.value.firstOrNull { it.id == id }?.let { AppResult.Success(it) } ?: notFound()
    }

    private fun <T> notFound(): AppResult<T> = AppResult.Failure(AppError.Server(HTTP_NOT_FOUND, "NOT_FOUND", null))

    private fun <T> conflict(message: String, code: String = "CONFLICT"): AppResult<T> =
        AppResult.Failure(AppError.Server(HTTP_CONFLICT, code, message))

    private companion object {
        const val HTTP_ACCEPTED = 202
        const val HTTP_NOT_FOUND = 404
        const val HTTP_CONFLICT = 409
        const val HTTP_LOCKED = 423
    }
}
