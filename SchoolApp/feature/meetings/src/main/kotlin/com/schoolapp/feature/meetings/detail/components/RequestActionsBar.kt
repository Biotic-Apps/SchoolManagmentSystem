package com.schoolapp.feature.meetings.detail.components

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.navigationBarsPadding
import androidx.compose.foundation.layout.padding
import androidx.compose.material3.HorizontalDivider
import androidx.compose.material3.Surface
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.unit.dp
import com.schoolapp.core.designsystem.component.PrimaryButton
import com.schoolapp.core.designsystem.component.SecondaryButton
import com.schoolapp.core.designsystem.theme.AppColors
import com.schoolapp.feature.meetings.R
import com.schoolapp.feature.meetings.detail.MeetingAction

/** Bottom bar for a parent's REQUESTED meeting: Accept the suggested time (primary), accept at another time, or Decline. */
@Composable
internal fun RequestActionsBar(
    busy: MeetingAction?,
    onAccept: () -> Unit,
    onAcceptChange: () -> Unit,
    onDecline: () -> Unit,
    modifier: Modifier = Modifier,
) {
    val enabled = busy == null
    Surface(modifier = modifier.fillMaxWidth(), color = AppColors.Surface) {
        Column {
            HorizontalDivider(color = AppColors.Border)
            Column(Modifier.navigationBarsPadding().padding(16.dp), verticalArrangement = Arrangement.spacedBy(8.dp)) {
                PrimaryButton(
                    text = stringResource(R.string.meetings_accept_request),
                    onClick = onAccept,
                    enabled = enabled,
                    loading = busy == MeetingAction.ACCEPT,
                    modifier = Modifier.fillMaxWidth(),
                )
                SecondaryButton(
                    text = stringResource(R.string.meetings_accept_change),
                    onClick = onAcceptChange,
                    enabled = enabled,
                    modifier = Modifier.fillMaxWidth(),
                )
                SecondaryButton(
                    text = stringResource(R.string.meetings_decline_request),
                    onClick = onDecline,
                    enabled = enabled,
                    loading = busy == MeetingAction.DECLINE,
                    contentColor = AppColors.Error,
                    modifier = Modifier.fillMaxWidth(),
                )
            }
        }
    }
}
