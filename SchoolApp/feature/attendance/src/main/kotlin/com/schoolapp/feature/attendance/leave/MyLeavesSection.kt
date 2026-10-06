package com.schoolapp.feature.attendance.leave

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.lazy.LazyListScope
import androidx.compose.foundation.lazy.items
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.unit.dp
import com.schoolapp.core.designsystem.component.AppTextButton
import com.schoolapp.core.designsystem.component.InlineMessage
import com.schoolapp.core.designsystem.component.SectionHeader
import com.schoolapp.core.designsystem.component.StatusTone
import com.schoolapp.core.designsystem.theme.AppColors
import com.schoolapp.core.ui.appErrorMessage
import com.schoolapp.feature.attendance.R
import com.schoolapp.feature.attendance.components.LeaveRequestCard

/** "My leave requests" block appended to a screen list. */
internal fun LazyListScope.myLeavesSection(state: MyLeavesState, onCancel: (String) -> Unit, onRetry: () -> Unit) {
    item(key = "leaves_header") { SectionHeader(title = stringResource(R.string.attendance_my_leave_requests)) }
    state.message?.let { message ->
        item(key = "leaves_message") {
            val text = when (message) {
                LeaveMessage.SENT -> R.string.attendance_leave_sent
                LeaveMessage.CANCELLED -> R.string.attendance_leave_cancelled
            }
            InlineMessage(stringResource(text), StatusTone.Success)
        }
    }
    state.actionError?.let { error -> item(key = "leaves_action_error") { InlineMessage(appErrorMessage(error), StatusTone.Error) } }
    when {
        state.isLoading -> item(key = "leaves_loading") { BodyText(stringResource(R.string.attendance_loading)) }
        state.error != null -> item(key = "leaves_error") {
            Column(verticalArrangement = Arrangement.spacedBy(8.dp)) {
                InlineMessage(appErrorMessage(state.error), StatusTone.Error)
                AppTextButton(stringResource(R.string.attendance_retry), onRetry)
            }
        }
        state.items.isEmpty() -> item(key = "leaves_empty") { BodyText(stringResource(R.string.attendance_leave_none)) }
        else -> items(state.items, key = { "leave_${it.id}" }) { leave ->
            LeaveRequestCard(
                leave = leave,
                onCancel = { onCancel(leave.id) },
                cancelling = state.cancellingId == leave.id,
            )
        }
    }
}

@Composable
private fun BodyText(text: String) {
    Text(text, style = MaterialTheme.typography.bodyMedium, color = AppColors.TextSecondary)
}
