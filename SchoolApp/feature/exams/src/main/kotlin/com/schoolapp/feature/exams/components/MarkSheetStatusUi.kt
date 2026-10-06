package com.schoolapp.feature.exams.components

import androidx.compose.runtime.Composable
import androidx.compose.runtime.ReadOnlyComposable
import androidx.compose.ui.res.stringResource
import com.schoolapp.core.designsystem.component.StatusTone
import com.schoolapp.core.model.exams.MarkSheetStatus
import com.schoolapp.feature.exams.R

@Composable
@ReadOnlyComposable
internal fun markSheetStatusLabel(status: MarkSheetStatus): String = stringResource(
    when (status) {
        MarkSheetStatus.NOT_ENTERED -> R.string.exams_status_not_entered
        MarkSheetStatus.DRAFT -> R.string.exams_status_draft
        MarkSheetStatus.SUBMITTED -> R.string.exams_status_submitted
        MarkSheetStatus.PENDING_REVIEW -> R.string.exams_status_pending_review
        MarkSheetStatus.ACCEPTED -> R.string.exams_status_accepted
        MarkSheetStatus.RETURNED -> R.string.exams_status_returned
    },
)

internal fun MarkSheetStatus.tone(): StatusTone = when (this) {
    MarkSheetStatus.NOT_ENTERED -> StatusTone.Neutral
    MarkSheetStatus.DRAFT, MarkSheetStatus.PENDING_REVIEW -> StatusTone.Warning
    MarkSheetStatus.SUBMITTED -> StatusTone.Info
    MarkSheetStatus.ACCEPTED -> StatusTone.Success
    MarkSheetStatus.RETURNED -> StatusTone.Error
}
