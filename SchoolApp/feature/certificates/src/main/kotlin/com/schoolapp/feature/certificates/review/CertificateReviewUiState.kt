package com.schoolapp.feature.certificates.review

import androidx.compose.runtime.Immutable
import com.schoolapp.core.common.result.AppError
import com.schoolapp.core.model.certificates.Certificate
import com.schoolapp.core.model.certificates.CertificateStatus
import com.schoolapp.core.model.certificates.CertificateType
import com.schoolapp.core.model.certificates.ClearanceBlock
import com.schoolapp.feature.certificates.components.CertificatePdf
import com.schoolapp.feature.certificates.review.request.StaffRequestForm

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
    val isRefreshing: Boolean = false,
    val error: AppError? = null,
    val certificates: List<Certificate> = emptyList(),
    /** `certificates.approve`: approve / reject requests. */
    val canApprove: Boolean = false,
    /** `certificates.add`: request for any student, issue and reissue. */
    val canIssue: Boolean = false,
    /** Requests whose approval or issue was blocked, with the clearance reasons. */
    val blocked: Map<String, ClearanceBlock> = emptyMap(),
    val busyIds: Set<String> = emptySet(),
    val actionError: Pair<String, AppError>? = null,
    /** PDF state per certificate id, once this screen issued it or checked it again. */
    val pdf: Map<String, CertificatePdf> = emptyMap(),
    val rejectForm: RejectForm? = null,
    val issueForm: IssueForm? = null,
    val reissueForm: ReissueForm? = null,
    val requestForm: StaffRequestForm? = null,
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

/** Confirm issuing; [effectiveDate] (yyyy-MM-dd) only for school leaving certificates. */
@Immutable
data class IssueForm(
    val certificateId: String,
    val type: CertificateType,
    val effectiveDate: String,
    val isSaving: Boolean = false,
    val error: AppError? = null,
) {
    val isLeaving: Boolean get() = type == CertificateType.SCHOOL_LEAVING
}

@Immutable
data class ReissueForm(
    val certificateId: String,
    val reason: String = "",
    val reasonMissing: Boolean = false,
    val isSaving: Boolean = false,
    val error: AppError? = null,
)

enum class ReviewMessage { APPROVED, REJECTED, ISSUED, REISSUED, REQUESTED }
