package com.schoolapp.feature.homework.components

import androidx.compose.runtime.Composable
import androidx.compose.ui.res.stringResource
import com.schoolapp.core.designsystem.component.StatusChip
import com.schoolapp.core.designsystem.component.StatusTone
import com.schoolapp.core.model.homework.HomeworkChange
import com.schoolapp.core.model.homework.HomeworkStatus
import com.schoolapp.core.model.homework.SubmissionStatus
import com.schoolapp.feature.homework.R

@Composable
internal fun HomeworkStatusChip(status: HomeworkStatus) {
    val (label, tone) = when (status) {
        HomeworkStatus.ACTIVE -> R.string.homework_status_active to StatusTone.Success
        HomeworkStatus.ARCHIVED -> R.string.homework_status_archived to StatusTone.Neutral
        HomeworkStatus.UNKNOWN -> R.string.homework_status_unknown to StatusTone.Neutral
    }
    StatusChip(stringResource(label), tone)
}

@Composable
internal fun SubmissionStatusChip(status: SubmissionStatus) {
    val (label, tone) = when (status) {
        SubmissionStatus.SUBMITTED -> R.string.homework_status_submitted to StatusTone.Info
        SubmissionStatus.LATE -> R.string.homework_status_late to StatusTone.Warning
        SubmissionStatus.GRADED -> R.string.homework_status_graded to StatusTone.Success
        SubmissionStatus.RETURNED -> R.string.homework_status_returned to StatusTone.Warning
        SubmissionStatus.UNKNOWN -> R.string.homework_status_unknown to StatusTone.Neutral
    }
    StatusChip(stringResource(label), tone)
}

/** Snackbar text after a mutation. */
@Composable
internal fun changeMessage(change: HomeworkChange): String = stringResource(
    when (change) {
        HomeworkChange.ASSIGNED -> R.string.homework_assigned_toast
        HomeworkChange.GRADED -> R.string.homework_graded_toast
        HomeworkChange.RETURNED -> R.string.homework_returned_toast
        HomeworkChange.SUBMITTED -> R.string.homework_submitted_toast
    },
)
