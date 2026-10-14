package com.schoolapp.feature.activities.detail

import androidx.compose.runtime.Immutable
import com.schoolapp.core.common.result.AppError
import com.schoolapp.core.designsystem.component.ApprovalAction
import com.schoolapp.core.model.activity.Activity
import com.schoolapp.core.model.activity.ActivityConsent
import com.schoolapp.core.model.activity.ActivityParticipant
import com.schoolapp.core.model.activity.ConsentStatus

enum class ActivityMessage { CONSENT_SAVED, APPROVED, REJECTED, STARTED, COMPLETED, CANCELLED }

@Immutable
data class ActivityDetailUiState(
    val isLoading: Boolean = true,
    val error: AppError? = null,
    val activity: Activity? = null,
    val timeRange: String = "",
    val isParent: Boolean = false,
    val childId: String? = null,
    val myConsent: ConsentStatus? = null,
    /** Parent can still grant/decline (now is on or before the deadline). */
    val consentOpen: Boolean = false,
    val consentNote: String = "",
    val busyDecision: ConsentStatus? = null,
    val canApprove: Boolean = false,
    val approvalComment: String = "",
    val busyApproval: ApprovalAction? = null,
    val actionError: AppError? = null,
    val consents: List<ActivityConsent> = emptyList(),
    val participants: List<ActivityParticipant> = emptyList(),
    val staffDataError: AppError? = null,
    val message: ActivityMessage? = null,
    val actions: LifecycleActions = LifecycleActions(),
) {
    private val parentConsentActions: Boolean
        get() = isParent && childId != null && activity?.consentRequired == true && consentOpen

    val showGrant: Boolean get() = parentConsentActions && myConsent != ConsentStatus.GRANTED
    val showDecline: Boolean get() = parentConsentActions && myConsent != ConsentStatus.DECLINED

    fun consentCount(status: ConsentStatus): Int = consents.count { it.status == status }
}
