package com.schoolapp.core.data.fees

import com.schoolapp.core.common.result.AppResult
import com.schoolapp.core.model.fees.DailyCollection
import com.schoolapp.core.model.fees.DuesRow
import com.schoolapp.core.model.fees.FeeSummary
import com.schoolapp.core.model.fees.FinanceOverview
import com.schoolapp.core.model.fees.Invoice
import com.schoolapp.core.model.fees.InvoiceStatus
import com.schoolapp.core.model.fees.Payment
import com.schoolapp.core.model.fees.RefundInput
import com.schoolapp.core.model.fees.PaymentInput
import com.schoolapp.core.model.fees.PaymentOutcome
import com.schoolapp.core.model.fees.PaymentProof
import com.schoolapp.core.model.fees.ProofInput
import com.schoolapp.core.model.fees.ProofStatus
import kotlinx.coroutines.flow.Flow

interface FeesRepository {
    /** Cash payments recorded offline and still waiting to be sent. */
    val queuedPayments: Flow<Int>

    suspend fun feeSummary(studentId: String): AppResult<FeeSummary>

    /** Newest period first; parents see only their children's invoices (server-side). */
    suspend fun invoices(studentId: String? = null, status: InvoiceStatus? = null, branchId: String? = null): AppResult<List<Invoice>>

    suspend fun invoice(id: String): AppResult<Invoice>

    /** Signed url of the receipt PDF of a payment. */
    suspend fun receiptUrl(paymentId: String): AppResult<String>

    suspend fun submitProof(input: ProofInput): AppResult<PaymentProof>

    suspend fun proofs(status: ProofStatus? = null, branchId: String? = null): AppResult<List<PaymentProof>>

    suspend fun verifyProof(id: String, note: String?): AppResult<PaymentProof>

    suspend fun rejectProof(id: String, reason: String): AppResult<PaymentProof>

    /** `POST /payments`; offline it is queued with [clientRequestId] and [PaymentOutcome.Queued] returned. */
    suspend fun recordPayment(input: PaymentInput, clientRequestId: String): AppResult<PaymentOutcome>

    /** Redirect url of the online gateway; `409 GATEWAY_DISABLED` when none is configured. */
    suspend fun payOnline(invoiceId: String): AppResult<String>

    suspend fun dues(search: String? = null, branchId: String? = null): AppResult<List<DuesRow>>

    suspend fun dailyCollection(date: String, branchId: String? = null): AppResult<DailyCollection>

    /** Queues fee reminders to the guardians of [studentIds]. */
    suspend fun sendDueReminders(studentIds: List<String>): AppResult<Unit>

    /** Sends a payment reversal for approval; returns the payment with its new status. */
    suspend fun reversePayment(paymentId: String, reason: String): AppResult<Payment>

    /** Sends a refund request for approval. */
    suspend fun requestRefund(input: RefundInput): AppResult<Unit>

    /** Closes the day with the counted cash; returns the closed collection. */
    suspend fun closeDay(date: String, cashCountedMinor: Long, note: String?, branchId: String?): AppResult<DailyCollection>

    suspend fun financeOverview(branchId: String? = null, month: String? = null): AppResult<FinanceOverview>
}
