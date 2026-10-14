package com.schoolapp.feature.activities.detail

import androidx.compose.runtime.Immutable
import com.schoolapp.core.model.SessionContext
import com.schoolapp.core.model.activity.Activity
import com.schoolapp.core.model.activity.ActivityStatus

/** Staff actions on one activity, mirroring the API guards (activity-status.ts, participants EDITABLE). */
@Immutable
data class LifecycleActions(
    val canEdit: Boolean = false,
    val canStart: Boolean = false,
    val canComplete: Boolean = false,
    val canCancel: Boolean = false,
    val canEditParticipants: Boolean = false,
    val busyStatus: ActivityStatus? = null,
    val cancelOpen: Boolean = false,
    val cancelReason: String = "",
    val cancelReasonMissing: Boolean = false,
) {
    val any: Boolean get() = canEdit || canStart || canComplete || canCancel

    fun forActivity(session: SessionContext, activity: Activity): LifecycleActions {
        val canChange = session.has(EDIT_PERMISSION)
        val status = activity.status
        val isProposer = activity.proposedById != null && activity.proposedById == session.user.id
        return copy(
            canEdit = canChange && status == ActivityStatus.PROPOSED && (isProposer || session.has(APPROVE_PERMISSION)),
            canStart = canChange && status == ActivityStatus.ANNOUNCED,
            canComplete = canChange && status == ActivityStatus.ONGOING,
            canCancel = canChange && status in CANCELLABLE,
            canEditParticipants = canChange && status in ROSTER_EDITABLE,
        )
    }

    companion object {
        const val EDIT_PERMISSION = "activities.edit"
        const val APPROVE_PERMISSION = "activities.approve"
        private val CANCELLABLE = setOf(ActivityStatus.PROPOSED, ActivityStatus.APPROVED, ActivityStatus.ANNOUNCED, ActivityStatus.ONGOING)
        private val ROSTER_EDITABLE = setOf(ActivityStatus.ANNOUNCED, ActivityStatus.ONGOING, ActivityStatus.COMPLETED)
    }
}
