package com.schoolapp.core.data.fees

import com.schoolapp.core.common.dispatcher.IoDispatcher
import com.schoolapp.core.common.result.AppError
import com.schoolapp.core.common.result.AppResult
import com.schoolapp.core.data.common.clean
import com.schoolapp.core.database.outbox.OutboxDao
import com.schoolapp.core.database.outbox.OutboxEntity
import com.schoolapp.core.model.fees.DailyCollection
import com.schoolapp.core.model.fees.DuesRow
import com.schoolapp.core.model.fees.FeeSummary
import com.schoolapp.core.model.fees.FinanceOverview
import com.schoolapp.core.model.fees.Invoice
import com.schoolapp.core.model.fees.InvoiceStatus
import com.schoolapp.core.model.fees.PaymentInput
import com.schoolapp.core.model.fees.PaymentOutcome
import com.schoolapp.core.model.fees.PaymentProof
import com.schoolapp.core.model.fees.ProofInput
import com.schoolapp.core.model.fees.ProofStatus
import com.schoolapp.core.network.ApiCaller
import com.schoolapp.core.network.api.FeesApi
import com.schoolapp.core.network.dto.common.ReasonBodyDto
import com.schoolapp.core.network.dto.fees.OnlineInitiateBodyDto
import com.schoolapp.core.network.dto.fees.PaymentBodyDto
import com.schoolapp.core.network.dto.fees.ProofBodyDto
import com.schoolapp.core.network.dto.fees.VerifyProofBodyDto
import com.schoolapp.core.sync.SyncScheduler
import kotlinx.coroutines.CoroutineDispatcher
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.distinctUntilChanged
import kotlinx.coroutines.flow.flowOn
import kotlinx.coroutines.flow.map
import kotlinx.coroutines.withContext
import kotlinx.serialization.json.Json
import javax.inject.Inject
import javax.inject.Singleton

@Singleton
class DefaultFeesRepository @Inject constructor(
    private val api: FeesApi,
    private val apiCaller: ApiCaller,
    private val outboxDao: OutboxDao,
    private val syncScheduler: SyncScheduler,
    private val json: Json,
    @IoDispatcher private val io: CoroutineDispatcher,
) : FeesRepository {

    override val queuedPayments: Flow<Int> = outboxDao.observeByType(OUTBOX_PAYMENT)
        .map { it.size }
        .distinctUntilChanged()
        .flowOn(io)

    override suspend fun feeSummary(studentId: String): AppResult<FeeSummary> =
        apiCaller.call { api.feeSummary(studentId).data.toModel() }

    override suspend fun invoices(studentId: String?, status: InvoiceStatus?, branchId: String?): AppResult<List<Invoice>> =
        apiCaller.call {
            api.invoices(studentId = studentId, branchId = branchId, status = status?.name).data.map { it.toModel() }
                .sortedWith(compareByDescending<Invoice> { it.period.orEmpty() }.thenByDescending { it.dueDate.orEmpty() })
        }

    override suspend fun invoice(id: String): AppResult<Invoice> = apiCaller.call { api.invoice(id).data.toModel() }

    override suspend fun receiptUrl(paymentId: String): AppResult<String> {
        val result = apiCaller.call { api.receipt(paymentId).data }
        return when (result) {
            is AppResult.Failure -> result
            is AppResult.Success -> (result.data.url ?: result.data.fileUrl)?.let { AppResult.Success(it) }
                ?: AppResult.Failure(AppError.Server(HTTP_ACCEPTED, CODE_NOT_READY, null))
        }
    }

    override suspend fun submitProof(input: ProofInput): AppResult<PaymentProof> = apiCaller.call {
        api.submitProof(
            ProofBodyDto(input.invoiceId, input.amountMinor, input.paidOn, input.method.name, input.reference.trim(), input.fileId),
        ).data.toModel()
    }

    override suspend fun proofs(status: ProofStatus?, branchId: String?): AppResult<List<PaymentProof>> =
        apiCaller.call { api.proofs(branchId, status?.name).data.map { it.toModel() }.sortedByDescending { it.createdAt.orEmpty() } }

    override suspend fun verifyProof(id: String, note: String?): AppResult<PaymentProof> =
        apiCaller.call { api.verifyProof(id, VerifyProofBodyDto(note = note.clean())).data.toModel() }

    override suspend fun rejectProof(id: String, reason: String): AppResult<PaymentProof> =
        apiCaller.call { api.rejectProof(id, ReasonBodyDto(reason.trim())).data.toModel() }

    override suspend fun recordPayment(input: PaymentInput, clientRequestId: String): AppResult<PaymentOutcome> {
        val body = PaymentBodyDto(
            studentId = input.studentId,
            amountMinor = input.amountMinor,
            method = input.method.name,
            reference = input.reference.clean(),
            receivedOn = input.receivedOn,
            clientRequestId = clientRequestId,
        )
        return when (val result = apiCaller.call { api.recordPayment(body, clientRequestId).data.toModel() }) {
            is AppResult.Success -> AppResult.Success(PaymentOutcome.Recorded(result.data))
            is AppResult.Failure -> if (result.error == AppError.Network) {
                enqueue(body)
                AppResult.Success(PaymentOutcome.Queued)
            } else {
                result
            }
        }
    }

    override suspend fun payOnline(invoiceId: String): AppResult<String> {
        val result = apiCaller.call { api.initiateOnline(OnlineInitiateBodyDto(invoiceId)).data }
        return when (result) {
            is AppResult.Failure -> result
            is AppResult.Success -> result.data.redirectUrl?.let { AppResult.Success(it) } ?: AppResult.Failure(AppError.Unknown())
        }
    }

    override suspend fun dues(search: String?, branchId: String?): AppResult<List<DuesRow>> =
        apiCaller.call { api.dues(branchId, search.clean()).data.mapNotNull { it.toModel() }.sortedByDescending { it.balanceMinor } }

    override suspend fun dailyCollection(date: String, branchId: String?): AppResult<DailyCollection> =
        apiCaller.call { api.dailyCollection(branchId, date).data.toModel(date) }

    override suspend fun financeOverview(branchId: String?, month: String?): AppResult<FinanceOverview> =
        apiCaller.call { api.financeDashboard(branchId, month).data.toModel() }

    private suspend fun enqueue(body: PaymentBodyDto) {
        withContext(io) {
            outboxDao.insert(
                OutboxEntity(
                    type = OUTBOX_PAYMENT,
                    method = "POST",
                    path = "payments",
                    payloadJson = json.encodeToString(PaymentBodyDto.serializer(), body),
                    clientRequestId = body.clientRequestId.orEmpty(),
                    createdAt = System.currentTimeMillis(),
                    entityKey = "payment|${body.studentId}",
                ),
            )
        }
        syncScheduler.requestSync()
    }

    internal companion object {
        const val OUTBOX_PAYMENT = "PAYMENT_RECORD"
        const val CODE_NOT_READY = "FILE_NOT_READY"
        private const val HTTP_ACCEPTED = 202
    }
}
