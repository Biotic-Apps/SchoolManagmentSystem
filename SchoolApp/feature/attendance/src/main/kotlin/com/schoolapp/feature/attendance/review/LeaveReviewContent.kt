package com.schoolapp.feature.attendance.review

import androidx.compose.foundation.lazy.items
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.outlined.Cancel
import androidx.compose.material.icons.outlined.CheckCircle
import androidx.compose.material.icons.outlined.EventAvailable
import androidx.compose.material.icons.outlined.HourglassTop
import androidx.compose.runtime.Composable
import androidx.compose.runtime.Immutable
import androidx.compose.ui.Modifier
import androidx.compose.ui.res.stringResource
import com.schoolapp.core.designsystem.component.AppTextButton
import com.schoolapp.core.designsystem.component.ApprovalAction
import com.schoolapp.core.designsystem.component.EmptyState
import com.schoolapp.core.designsystem.component.ErrorState
import com.schoolapp.core.designsystem.component.FilterChipRow
import com.schoolapp.core.designsystem.component.InlineMessage
import com.schoolapp.core.designsystem.component.LoadingState
import com.schoolapp.core.designsystem.component.PullableState
import com.schoolapp.core.designsystem.component.ScreenColumn
import com.schoolapp.core.designsystem.component.StatusTone
import com.schoolapp.core.designsystem.component.SwitcherOption
import com.schoolapp.core.designsystem.theme.AppColors
import com.schoolapp.core.model.leave.LeaveStatus
import com.schoolapp.core.ui.appErrorMessage
import com.schoolapp.feature.attendance.R
import com.schoolapp.feature.attendance.components.LeaveRequestCard
import com.schoolapp.feature.attendance.components.LeaveStat
import com.schoolapp.feature.attendance.components.LeaveStatTiles
import com.schoolapp.feature.attendance.components.leaveStatusLabel

@Immutable
internal class LeaveReviewActions(
    val onRetry: () -> Unit,
    val onOpen: (String) -> Unit,
    val onQuickDecide: (String, ApprovalAction) -> Unit,
    val onDecidedFilter: (LeaveStatus?) -> Unit,
)

@Composable
internal fun LeaveReviewContent(state: LeaveReviewUiState, actions: LeaveReviewActions, modifier: Modifier = Modifier) {
    when {
        state.isLoading -> LoadingState(modifier)
        state.error != null && state.pending.isEmpty() && state.decided.isEmpty() -> PullableState(modifier) {
            ErrorState(appErrorMessage(state.error), onRetry = actions.onRetry)
        }
        else -> ScreenColumn(modifier) {
            state.error?.let { item(key = "refresh_error") { InlineMessage(appErrorMessage(it), StatusTone.Error) } }
            state.message?.let { message ->
                item(key = "message") {
                    val text = if (message == ReviewMessage.APPROVED) R.string.attendance_leave_approved_message else R.string.attendance_leave_rejected_message
                    InlineMessage(stringResource(text), StatusTone.Success)
                }
            }
            item(key = "summary") { ReviewSummary(state) }
            if (state.tab == ReviewTab.DECIDED && state.decided.isNotEmpty()) {
                item(key = "filter") { DecidedFilter(state.decidedFilter, actions.onDecidedFilter) }
            }
            if (state.items.isEmpty()) {
                item(key = "empty") {
                    EmptyState(
                        title = stringResource(
                            if (state.tab == ReviewTab.PENDING) R.string.attendance_review_empty_pending else R.string.attendance_review_empty_decided,
                        ),
                        icon = Icons.Outlined.EventAvailable,
                    )
                }
            }
            val pending = state.tab == ReviewTab.PENDING
            items(state.items, key = { it.id }) { leave ->
                LeaveRequestCard(
                    leave = leave,
                    showSubject = true,
                    onClick = if (pending) ({ actions.onOpen(leave.id) }) else null,
                    actions = if (pending) {
                        {
                            AppTextButton(
                                text = stringResource(R.string.attendance_leave_reject),
                                onClick = { actions.onQuickDecide(leave.id, ApprovalAction.Reject) },
                                contentColor = AppColors.Error,
                                leadingIcon = Icons.Outlined.Cancel,
                            )
                            AppTextButton(
                                text = stringResource(R.string.attendance_leave_approve),
                                onClick = { actions.onQuickDecide(leave.id, ApprovalAction.Approve) },
                                leadingIcon = Icons.Outlined.CheckCircle,
                            )
                        }
                    } else {
                        null
                    },
                )
            }
        }
    }
}

@Composable
private fun ReviewSummary(state: LeaveReviewUiState) {
    LeaveStatTiles(
        listOf(
            LeaveStat(stringResource(R.string.leave_tile_pending), state.pending.size, Icons.Outlined.HourglassTop, StatusTone.Warning),
            LeaveStat(leaveStatusLabel(LeaveStatus.APPROVED), state.approvedCount, Icons.Outlined.CheckCircle, StatusTone.Success),
            LeaveStat(leaveStatusLabel(LeaveStatus.REJECTED), state.rejectedCount, Icons.Outlined.Cancel, StatusTone.Error),
        ),
    )
}

@Composable
private fun DecidedFilter(selected: LeaveStatus?, onSelect: (LeaveStatus?) -> Unit) {
    val decided = listOf(LeaveStatus.APPROVED, LeaveStatus.REJECTED, LeaveStatus.CANCELLED)
    FilterChipRow(
        options = listOf(SwitcherOption(ALL, stringResource(R.string.leave_filter_all))) + decided.map { SwitcherOption(it.name, leaveStatusLabel(it)) },
        selectedId = selected?.name ?: ALL,
        onSelect = { id -> onSelect(decided.firstOrNull { it.name == id }) },
    )
}

private const val ALL = "ALL"
