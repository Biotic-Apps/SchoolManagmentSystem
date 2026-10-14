package com.schoolapp.feature.meetings.detail

import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.res.stringResource
import com.schoolapp.core.common.result.AppError
import com.schoolapp.core.designsystem.component.AppBottomSheet
import com.schoolapp.core.designsystem.component.InlineMessage
import com.schoolapp.core.designsystem.component.PrimaryButton
import com.schoolapp.core.designsystem.component.StatusTone
import com.schoolapp.core.designsystem.theme.AppColors
import com.schoolapp.core.ui.appErrorMessage
import com.schoolapp.feature.meetings.R
import com.schoolapp.feature.meetings.components.MeetingTimeFields
import com.schoolapp.feature.meetings.domain.MeetingTimeDraft
import com.schoolapp.feature.meetings.domain.MeetingTimeProblem

/** Accept a parent's request at another date, time, mode or place; the parent is notified. */
@Composable
internal fun AcceptMeetingSheet(
    draft: MeetingTimeDraft,
    problems: Set<MeetingTimeProblem>,
    today: String,
    busy: Boolean,
    error: AppError?,
    onChange: (MeetingTimeDraft) -> Unit,
    onSubmit: () -> Unit,
    onDismiss: () -> Unit,
) {
    AppBottomSheet(title = stringResource(R.string.meetings_accept_change_title), onDismiss = onDismiss) {
        Text(
            stringResource(R.string.meetings_accept_change_help),
            style = MaterialTheme.typography.bodyMedium,
            color = AppColors.TextSecondary,
        )
        error?.let { InlineMessage(appErrorMessage(it), StatusTone.Error) }
        MeetingTimeFields(draft, problems, minDate = today, enabled = !busy, onChange = onChange)
        PrimaryButton(stringResource(R.string.meetings_confirm_meeting), onSubmit, loading = busy)
    }
}
