package com.schoolapp.feature.certificates.review

import androidx.compose.runtime.Immutable
import com.schoolapp.core.common.result.AppError
import com.schoolapp.core.model.certificates.Certificate
import com.schoolapp.core.model.certificates.CertificateStatus
import com.schoolapp.core.model.certificates.ClearanceBlock

/** Status filter chips; [status] null = all. */
enum class ReviewFilter(val status: CertificateStatus?) {
    REQUESTED(CertificateStatus.REQUESTED),
    APPROVED(CertificateStatus.APPROVED),
    ISSUED(CertificateStatus.ISSUED),
    REJECTED(CertificateStatus.REJECTED),
    ALL(null),
}

@Immutable
data class CertificateReviewUiState(
    val filter: ReviewFilter = ReviewFilter.REQUESTED,
    val isLoading: Boolean = true,
    val error: AppError? = null,
    val certificates: List<Certificate> = emptyList(),
    val canApprove: Boolean = false,
    /** Requests whose approval was blocked, with the clearance reasons. */
    val blocked: Map<String, ClearanceBlock> = emptyMap(),
    val busyIds: Set<String> = emptySet(),
    val actionError: Pair<String, AppError>? = null,
    val rejectForm: RejectForm? = null,
    val message: ReviewMessage? = null,
)

@Immutable
data class RejectForm(
    val certificateId: String,
    val reason: String = "",
    val reasonMissing: Boolean = false,
    val isSaving: Boolean = false,
    val error: AppError? = null,
)

enum class ReviewMessage { APPROVED, REJECTED }
