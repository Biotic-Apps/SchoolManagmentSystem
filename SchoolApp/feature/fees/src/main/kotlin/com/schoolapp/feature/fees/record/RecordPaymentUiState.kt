package com.schoolapp.feature.fees.record

import androidx.compose.runtime.Immutable
import com.schoolapp.core.common.result.AppError
import com.schoolapp.core.model.fees.PaymentInput
import com.schoolapp.core.model.fees.PaymentMethod
import com.schoolapp.core.model.people.StudentSummary

/** A send that has not succeeded yet; retrying the identical input reuses [clientRequestId]. */
data class PendingPayment(val input: PaymentInput, val clientRequestId: String)

sealed interface RecordResult {
    data class Recorded(val receiptNo: String?, val amountMinor: Long, val studentName: String?) : RecordResult

    /** Saved in the outbox; sent when the device is back online. */
    data object Queued : RecordResult
}

@Immutable
data class RecordPaymentUiState(
    val today: String = "",
    val search: String = "",
    val isSearching: Boolean = false,
    val searchError: AppError? = null,
    val results: List<StudentSummary> = emptyList(),
    val student: StudentSummary? = null,
    val amountText: String = "",
    val method: PaymentMethod = PaymentMethod.CASH,
    val reference: String = "",
    val receivedOn: String = "",
    val issues: Set<PaymentIssue> = emptySet(),
    val isSaving: Boolean = false,
    val error: AppError? = null,
    val pending: PendingPayment? = null,
    val result: RecordResult? = null,
)
