package com.schoolapp.feature.meetings.detail.components

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.navigationBarsPadding
import androidx.compose.foundation.layout.padding
import androidx.compose.material3.HorizontalDivider
import androidx.compose.material3.Surface
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.unit.dp
import com.schoolapp.core.designsystem.component.AppTextButton
import com.schoolapp.core.designsystem.component.PrimaryButton
import com.schoolapp.core.designsystem.component.SecondaryButton
import com.schoolapp.core.designsystem.theme.AppColors
import com.schoolapp.feature.meetings.R
import com.schoolapp.feature.meetings.detail.MeetingAction

/** Bottom bar for a SCHEDULED meeting: Complete (primary), Cancel, No-show. */
@Composable
internal fun MeetingActionsBar(
    busy: MeetingAction?,
    onComplete: () -> Unit,
    onCancel: () -> Unit,
    onNoShow: () -> Unit,
    modifier: Modifier = Modifier,
) {
    val enabled = busy == null
    Surface(modifier = modifier.fillMaxWidth(), color = AppColors.Surface) {
        Column {
            HorizontalDivider(color = AppColors.Border)
            Column(Modifier.navigationBarsPadding().padding(16.dp), verticalArrangement = Arrangement.spacedBy(8.dp)) {
                PrimaryButton(
                    text = stringResource(R.string.meetings_complete),
                    onClick = onComplete,
                    enabled = enabled,
                    loading = busy == MeetingAction.COMPLETE,
                    modifier = Modifier.fillMaxWidth(),
                )
                Row(horizontalArrangement = Arrangement.spacedBy(12.dp)) {
                    SecondaryButton(
                        text = stringResource(R.string.meetings_cancel_meeting),
                        onClick = onCancel,
                        enabled = enabled,
                        loading = busy == MeetingAction.CANCEL,
                        contentColor = AppColors.Error,
                        modifier = Modifier.weight(1f),
                    )
                    AppTextButton(
                        text = stringResource(R.string.meetings_no_show),
                        onClick = onNoShow,
                        enabled = enabled,
                        loading = busy == MeetingAction.NO_SHOW,
                        modifier = Modifier.weight(1f),
                    )
                }
            }
        }
    }
}
