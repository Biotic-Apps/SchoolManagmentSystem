package com.schoolapp.feature.attendance.leave

import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.lazy.LazyListScope
import androidx.compose.foundation.lazy.items
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.outlined.EventBusy
import androidx.compose.material.icons.outlined.FilterAltOff
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.unit.dp
import com.schoolapp.core.designsystem.component.AppTextButton
import com.schoolapp.core.designsystem.component.EmptyState
import com.schoolapp.core.designsystem.component.ErrorState
import com.schoolapp.core.designsystem.component.InlineMessage
import com.schoolapp.core.designsystem.component.LoadingState
import com.schoolapp.core.designsystem.component.PullableState
import com.schoolapp.core.designsystem.component.RefreshBox
import com.schoolapp.core.designsystem.component.ScreenColumn
import com.schoolapp.core.designsystem.component.StatusTone
import com.schoolapp.core.designsystem.theme.AppColors
import com.schoolapp.core.model.leave.LeaveStatus
import com.schoolapp.core.ui.appErrorMessage
import com.schoolapp.feature.attendance.R
import com.schoolapp.feature.attendance.components.LeaveRequestCard

/** The "Leave" side of a self-service screen: summary tiles, status filter and the caller's own requests. */
@Composable
internal fun MyLeavesPanel(
    state: MyLeavesState,
    isChild: Boolean,
    onFilter: (LeaveStatus?) -> Unit,
    onAskCancel: (String) -> Unit,
    onRetry: () -> Unit,
    onRefresh: () -> Unit,
    modifier: Modifier = Modifier,
) {
    RefreshBox(state.isRefreshing, onRefresh, modifier.fillMaxSize()) {
        when {
            state.isLoading -> LoadingState()
            state.error != null && state.items.isEmpty() -> PullableState {
                ErrorState(appErrorMessage(state.error), title = stringResource(R.string.leave_load_failed), onRetry = onRetry)
            }
            else -> ScreenColumn(contentPadding = PaddingValues(start = 16.dp, top = 16.dp, end = 16.dp, bottom = FAB_CLEARANCE)) {
                state.message?.let { message ->
                    item(key = "message") {
                        val text = if (message == LeaveMessage.SENT) R.string.attendance_leave_sent else R.string.attendance_leave_cancelled
                        InlineMessage(stringResource(text), StatusTone.Success)
                    }
                }
                state.actionError?.let { item(key = "action_error") { InlineMessage(appErrorMessage(it), StatusTone.Error) } }
                state.error?.let { item(key = "refresh_error") { InlineMessage(appErrorMessage(it), StatusTone.Error) } }
                item(key = "summary") { MyLeaveSummary(state.summary) }
                if (state.items.isNotEmpty()) {
                    item(key = "filter") { LeaveStatusFilter(state.filter, onFilter) }
                }
                leaveList(state, isChild, onFilter, onAskCancel)
            }
        }
    }
}

private fun LazyListScope.leaveList(
    state: MyLeavesState,
    isChild: Boolean,
    onFilter: (LeaveStatus?) -> Unit,
    onAskCancel: (String) -> Unit,
) {
    val visible = state.visible
    when {
        state.items.isEmpty() -> item(key = "empty") {
            EmptyState(
                title = stringResource(R.string.leave_empty_title),
                message = stringResource(if (isChild) R.string.leave_empty_message_parent else R.string.leave_empty_message_staff),
                icon = Icons.Outlined.EventBusy,
            )
        }
        visible.isEmpty() -> item(key = "empty_filtered") {
            EmptyState(
                title = stringResource(R.string.leave_empty_filtered),
                icon = Icons.Outlined.FilterAltOff,
                action = { AppTextButton(stringResource(R.string.leave_filter_all), { onFilter(null) }) },
            )
        }
        else -> items(visible, key = { "leave_${it.id}" }) { leave ->
            val pending = leave.status == LeaveStatus.SUBMITTED
            LeaveRequestCard(
                leave = leave,
                actions = if (pending) {
                    {
                        AppTextButton(
                            text = stringResource(R.string.attendance_leave_cancel),
                            onClick = { onAskCancel(leave.id) },
                            loading = state.cancellingId == leave.id,
                            contentColor = AppColors.Error,
                        )
                    }
                } else {
                    null
                },
            )
        }
    }
}

private val FAB_CLEARANCE = 96.dp
