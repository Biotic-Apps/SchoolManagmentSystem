package com.schoolapp.feature.exams.overview.components

import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.outlined.Calculate
import androidx.compose.material.icons.outlined.Campaign
import androidx.compose.material.icons.outlined.CheckCircle
import androidx.compose.material.icons.outlined.Lock
import androidx.compose.material.icons.outlined.LockOpen
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.unit.dp
import com.schoolapp.core.designsystem.component.AppCard
import com.schoolapp.core.designsystem.component.InlineMessage
import com.schoolapp.core.designsystem.component.PrimaryButton
import com.schoolapp.core.designsystem.component.SecondaryButton
import com.schoolapp.core.designsystem.component.StatusTone
import com.schoolapp.core.designsystem.theme.AppColors
import com.schoolapp.core.model.exams.ExamStatus
import com.schoolapp.core.model.exams.admin.ExamDetail
import com.schoolapp.core.ui.appErrorMessage
import com.schoolapp.feature.exams.R
import com.schoolapp.feature.exams.overview.ExamWorkflowState
import com.schoolapp.feature.exams.overview.WorkflowAction
import com.schoolapp.feature.exams.overview.WorkflowMessage

/** Hint for the exam's status plus the actions this user may take now. */
@Composable
internal fun WorkflowCard(exam: ExamDetail, state: ExamWorkflowState, onAction: (WorkflowAction) -> Unit) {
    AppCard(verticalSpacing = 12.dp) {
        Text(stringResource(R.string.exams_next_step), style = MaterialTheme.typography.titleMedium, color = AppColors.TextPrimary)
        Text(stringResource(hintFor(exam.status)), style = MaterialTheme.typography.bodyMedium, color = AppColors.TextSecondary)
        if (exam.awaitingApproval) InlineMessage(stringResource(R.string.exams_awaiting_approval), StatusTone.Info)
        if (state.running == WorkflowAction.COMPUTE) InlineMessage(stringResource(R.string.exams_computing), StatusTone.Info)
        state.message?.let { InlineMessage(stringResource(messageText(it)), if (it == WorkflowMessage.COMPUTE_RUNNING) StatusTone.Info else StatusTone.Success) }
        state.error?.let { InlineMessage(appErrorMessage(it), StatusTone.Error) }
        if (state.blocking.isNotEmpty()) UnacceptedSheets(state)
        availableActions(exam, state).forEachIndexed { index, action ->
            val (label, icon) = labelOf(action)
            val busy = state.running == action
            val enabled = state.running == null
            if (index == 0) {
                PrimaryButton(stringResource(label), { onAction(action) }, Modifier.fillMaxWidth(), enabled = enabled, loading = busy, leadingIcon = icon)
            } else {
                SecondaryButton(stringResource(label), { onAction(action) }, Modifier.fillMaxWidth(), enabled = enabled, loading = busy, leadingIcon = icon)
            }
        }
    }
}

@Composable
private fun UnacceptedSheets(state: ExamWorkflowState) {
    InlineMessage(stringResource(R.string.exams_unaccepted_title), StatusTone.Warning)
    state.blocking.forEach { sheet ->
        val text = listOfNotNull(sheet.label, sheet.status).joinToString(" · ")
        Text("• $text", style = MaterialTheme.typography.bodyMedium, color = AppColors.TextPrimary)
    }
}

/** Web parity: open/close with `exams.edit`, compute & approve with `exams.approve`, publish with `exams.publish`. */
internal fun availableActions(exam: ExamDetail, state: ExamWorkflowState): List<WorkflowAction> = buildList {
    when (exam.status) {
        ExamStatus.SCHEDULED -> if (state.canEdit) add(WorkflowAction.OPEN_MARKS)
        ExamStatus.MARKS_OPEN -> if (state.canEdit) add(WorkflowAction.CLOSE_MARKS)
        ExamStatus.MARKS_CLOSED -> if (state.canApprove) {
            if (!exam.awaitingApproval) add(WorkflowAction.SEND_FOR_APPROVAL)
            add(WorkflowAction.COMPUTE)
        }
        ExamStatus.RESULTS_APPROVED -> if (state.canPublish) add(WorkflowAction.PUBLISH)
        ExamStatus.DRAFT, ExamStatus.PUBLISHED -> Unit
    }
}

private fun labelOf(action: WorkflowAction): Pair<Int, ImageVector> = when (action) {
    WorkflowAction.OPEN_MARKS -> R.string.exams_open_marks to Icons.Outlined.LockOpen
    WorkflowAction.CLOSE_MARKS -> R.string.exams_close_marks to Icons.Outlined.Lock
    WorkflowAction.COMPUTE -> R.string.exams_compute to Icons.Outlined.Calculate
    WorkflowAction.SEND_FOR_APPROVAL -> R.string.exams_send_for_approval to Icons.Outlined.CheckCircle
    WorkflowAction.PUBLISH -> R.string.exams_publish to Icons.Outlined.Campaign
}

private fun hintFor(status: ExamStatus): Int = when (status) {
    ExamStatus.DRAFT -> R.string.exams_hint_draft
    ExamStatus.SCHEDULED -> R.string.exams_hint_scheduled
    ExamStatus.MARKS_OPEN -> R.string.exams_hint_marks_open
    ExamStatus.MARKS_CLOSED -> R.string.exams_hint_marks_closed
    ExamStatus.RESULTS_APPROVED -> R.string.exams_hint_results_approved
    ExamStatus.PUBLISHED -> R.string.exams_hint_published
}

private fun messageText(message: WorkflowMessage): Int = when (message) {
    WorkflowMessage.MARKS_OPENED -> R.string.exams_marks_opened
    WorkflowMessage.MARKS_CLOSED -> R.string.exams_marks_closed
    WorkflowMessage.COMPUTED -> R.string.exams_computed
    WorkflowMessage.COMPUTE_RUNNING -> R.string.exams_compute_running
    WorkflowMessage.SENT_FOR_APPROVAL -> R.string.exams_sent_for_approval
    WorkflowMessage.PUBLISHED -> R.string.exams_published
}
