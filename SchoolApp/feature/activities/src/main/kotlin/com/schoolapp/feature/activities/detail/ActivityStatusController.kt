package com.schoolapp.feature.activities.detail

import com.schoolapp.core.common.result.AppResult
import com.schoolapp.core.data.activities.ActivitiesRepository
import com.schoolapp.core.model.activity.Activity
import com.schoolapp.core.model.activity.ActivityStatus
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.update
import kotlinx.coroutines.launch

/** Start / complete / cancel (with a reason) for the detail screen; [onChanged] re-applies the returned activity. */
internal class ActivityStatusController(
    private val activityId: String,
    private val repository: ActivitiesRepository,
    private val scope: CoroutineScope,
    private val state: MutableStateFlow<ActivityDetailUiState>,
    private val onChanged: (Activity) -> Unit,
) {
    fun start() = change(ActivityStatus.ONGOING, null)

    fun complete() = change(ActivityStatus.COMPLETED, null)

    fun openCancel() = edit { it.copy(cancelOpen = true, cancelReason = "", cancelReasonMissing = false) }

    fun dismissCancel() = edit { it.copy(cancelOpen = false) }

    fun onCancelReasonChange(reason: String) = edit { it.copy(cancelReason = reason, cancelReasonMissing = false) }

    fun confirmCancel() {
        val reason = state.value.actions.cancelReason.trim()
        if (reason.isEmpty()) return edit { it.copy(cancelReasonMissing = true) }
        change(ActivityStatus.CANCELLED, reason)
    }

    private fun change(target: ActivityStatus, reason: String?) {
        if (state.value.actions.busyStatus != null) return
        edit { it.copy(busyStatus = target) }
        state.update { it.copy(actionError = null, message = null) }
        scope.launch {
            when (val result = repository.setStatus(activityId, target, reason)) {
                is AppResult.Failure -> {
                    edit { it.copy(busyStatus = null) }
                    state.update { it.copy(actionError = result.error) }
                }
                is AppResult.Success -> {
                    edit { it.copy(busyStatus = null, cancelOpen = false, cancelReason = "") }
                    state.update { it.copy(message = target.message()) }
                    onChanged(result.data)
                }
            }
        }
    }

    private fun edit(transform: (LifecycleActions) -> LifecycleActions) = state.update { it.copy(actions = transform(it.actions)) }

    private fun ActivityStatus.message(): ActivityMessage = when (this) {
        ActivityStatus.ONGOING -> ActivityMessage.STARTED
        ActivityStatus.COMPLETED -> ActivityMessage.COMPLETED
        else -> ActivityMessage.CANCELLED
    }
}
