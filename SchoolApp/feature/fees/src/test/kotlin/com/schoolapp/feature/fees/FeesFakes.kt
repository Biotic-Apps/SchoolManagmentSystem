package com.schoolapp.feature.fees

import com.schoolapp.core.common.result.AppError
import com.schoolapp.core.common.result.AppResult
import com.schoolapp.core.data.fees.FeesRepository
import com.schoolapp.core.data.people.StudentsRepository
import com.schoolapp.core.model.ChildSummary
import com.schoolapp.core.model.RoleKey
import com.schoolapp.core.model.fees.DailyCollection
import com.schoolapp.core.model.fees.DuesRow
import com.schoolapp.core.model.fees.FeeSummary
import com.schoolapp.core.model.fees.FinanceOverview
import com.schoolapp.core.model.fees.Invoice
import com.schoolapp.core.model.fees.InvoiceStatus
import com.schoolapp.core.model.fees.Payment
import com.schoolapp.core.model.fees.PaymentInput
import com.schoolapp.core.model.fees.PaymentOutcome
import com.schoolapp.core.model.fees.PaymentProof
import com.schoolapp.core.model.fees.ProofInput
import com.schoolapp.core.model.fees.ProofStatus
import com.schoolapp.core.model.people.StudentDetail
import com.schoolapp.core.model.people.StudentSummary
import com.schoolapp.core.testing.TestSessions
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.MutableStateFlow

class FakeFeesRepository : FeesRepository {
    val summaryCalls = mutableListOf<String>()
    val invoiceCalls = mutableListOf<String?>()
    val recordCalls = mutableListOf<Pair<PaymentInput, String>>()
    var summaries: Map<String, FeeSummary> = emptyMap()
    var invoicesByStudent: Map<String, List<Invoice>> = emptyMap()
    var recordResults: ArrayDeque<AppResult<PaymentOutcome>> = ArrayDeque()
    var payOnlineResult: AppResult<String> = AppResult.Failure(AppError.Server(409, "GATEWAY_DISABLED", null))
    val queued = MutableStateFlow(0)

    override val queuedPayments: Flow<Int> = queued

    override suspend fun feeSummary(studentId: String): AppResult<FeeSummary> {
        summaryCalls += studentId
        return summaries[studentId]?.let { AppResult.Success(it) } ?: AppResult.Failure(AppError.Server(404, "NOT_FOUND", null))
    }

    override suspend fun invoices(studentId: String?, status: InvoiceStatus?, branchId: String?): AppResult<List<Invoice>> {
        invoiceCalls += studentId
        return AppResult.Success(invoicesByStudent[studentId].orEmpty())
    }

    override suspend fun invoice(id: String): AppResult<Invoice> =
        invoicesByStudent.values.flatten().firstOrNull { it.id == id }?.let { AppResult.Success(it) }
            ?: AppResult.Failure(AppError.Server(404, "NOT_FOUND", null))

    override suspend fun receiptUrl(paymentId: String): AppResult<String> = AppResult.Failure(AppError.Server(202, "FILE_NOT_READY", null))

    override suspend fun submitProof(input: ProofInput): AppResult<PaymentProof> = AppResult.Failure(AppError.Unknown())

    override suspend fun proofs(status: ProofStatus?, branchId: String?): AppResult<List<PaymentProof>> = AppResult.Success(emptyList())

    override suspend fun verifyProof(id: String, note: String?): AppResult<PaymentProof> = AppResult.Failure(AppError.Unknown())

    override suspend fun rejectProof(id: String, reason: String): AppResult<PaymentProof> = AppResult.Failure(AppError.Unknown())

    override suspend fun recordPayment(input: PaymentInput, clientRequestId: String): AppResult<PaymentOutcome> {
        recordCalls += input to clientRequestId
        return recordResults.removeFirstOrNull() ?: AppResult.Success(PaymentOutcome.Queued)
    }

    override suspend fun payOnline(invoiceId: String): AppResult<String> = payOnlineResult

    override suspend fun dues(search: String?, branchId: String?): AppResult<List<DuesRow>> = AppResult.Success(emptyList())

    override suspend fun dailyCollection(date: String, branchId: String?): AppResult<DailyCollection> =
        AppResult.Success(DailyCollection(date, 0, emptyList(), emptyList(), emptyList(), closed = false))

    override suspend fun financeOverview(branchId: String?, month: String?): AppResult<FinanceOverview> =
        AppResult.Success(FinanceOverview(0, 0, 0, 0, 0.0, 0, 0, 0))
}

class FakeStudentsRepository(private val all: List<StudentSummary> = emptyList()) : StudentsRepository {
    override suspend fun students(sectionId: String?, search: String?): AppResult<List<StudentSummary>> =
        AppResult.Success(all.filter { search == null || it.name.contains(search, ignoreCase = true) })

    override suspend fun student(id: String): AppResult<StudentDetail> = AppResult.Failure(AppError.Unknown())
}

object FeesFixtures {
    fun summary(totalDue: Long = 850_000, online: Boolean = false, proof: Boolean = true) = FeeSummary(
        totalDueMinor = totalDue,
        overdueMinor = 0,
        advanceMinor = 0,
        lastPayment = null,
        nextDue = null,
        currency = "PKR",
        proofUploadEnabled = proof,
        onlineGatewayEnabled = online,
    )

    fun invoice(id: String, studentId: String, balance: Long = 850_000, status: InvoiceStatus = InvoiceStatus.ISSUED) = Invoice(
        id = id,
        invoiceNo = "INV-MAIN-202610-$id",
        studentId = studentId,
        studentName = "Student $studentId",
        admissionNo = null,
        className = "Class 5",
        sectionName = "A",
        period = "2026-10",
        issueDate = "2026-10-01",
        dueDate = "2026-10-10",
        status = status,
        lines = emptyList(),
        concessionMinor = 0,
        lateFeeMinor = 0,
        totalMinor = 850_000,
        paidMinor = 850_000 - balance,
        balanceMinor = balance,
        payments = emptyList(),
        currency = "PKR",
    )

    fun student(id: String, name: String) = StudentSummary(
        id = id, admissionNo = "BS-$id", name = name, photoUrl = null, gender = null, dob = null, className = "Class 5",
        sectionName = "A", sectionId = "sec", rollNo = 1, status = "ACTIVE", primaryGuardianName = null, primaryGuardianPhone = null,
    )

    fun payment(receiptNo: String, amount: Long) = Payment("p1", receiptNo, "s1", "Ali", amount, com.schoolapp.core.model.fees.PaymentMethod.CASH, null, "2026-10-06", "Cashier", "RECORDED")

    val child1 = ChildSummary("c1", "Ayesha Khan", "Class 5", "A")
    val child2 = ChildSummary("c2", "Omar Khan", "Class 4", "B")

    fun parentSession(activeChildId: String = "c1") =
        TestSessions.session(RoleKey.PARENT, "fees.view", branchId = null).copy(children = listOf(child1, child2), activeChildId = activeChildId)
}
