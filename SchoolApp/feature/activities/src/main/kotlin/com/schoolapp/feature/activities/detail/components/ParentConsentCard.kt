package com.schoolapp.feature.activities.detail.components

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.unit.dp
import com.schoolapp.core.designsystem.component.AppCard
import com.schoolapp.core.designsystem.component.AppTextArea
import com.schoolapp.core.designsystem.component.PrimaryButton
import com.schoolapp.core.designsystem.component.SecondaryButton
import com.schoolapp.core.designsystem.component.StatusChip
import com.schoolapp.core.designsystem.theme.AppColors
import com.schoolapp.core.model.activity.ConsentStatus
import com.schoolapp.core.ui.formatTimestamp
import com.schoolapp.feature.activities.R
import com.schoolapp.feature.activities.components.labelRes
import com.schoolapp.feature.activities.components.tone
import com.schoolapp.feature.activities.detail.ActivityDetailUiState

/** Parent permission slip: current answer, Grant / Decline while the window is open. */
@Composable
internal fun ParentConsentCard(
    state: ActivityDetailUiState,
    onNoteChange: (String) -> Unit,
    onDecide: (ConsentStatus) -> Unit,
    modifier: Modifier = Modifier,
) {
    val status = state.myConsent ?: ConsentStatus.PENDING
    val deadline = formatTimestamp(state.activity?.consentDeadline)
    val busy = state.busyDecision != null
    AppCard(modifier) {
        Column(verticalArrangement = Arrangement.spacedBy(12.dp)) {
            Row(verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(12.dp)) {
                Text(
                    stringResource(R.string.activities_consent_title),
                    style = MaterialTheme.typography.titleMedium,
                    color = AppColors.TextPrimary,
                    modifier = Modifier.weight(1f),
                )
                StatusChip(stringResource(status.labelRes()), status.tone())
            }
            val timing = when {
                !state.consentOpen && deadline != null -> stringResource(R.string.activities_consent_closed_on, deadline)
                !state.consentOpen -> stringResource(R.string.activities_consent_closed)
                deadline != null -> stringResource(R.string.activities_consent_respond_by, deadline)
                else -> null
            }
            timing?.let { Text(it, style = MaterialTheme.typography.bodyMedium, color = AppColors.TextSecondary) }
            Text(stringResource(R.string.activities_consent_hint), style = MaterialTheme.typography.bodySmall, color = AppColors.TextSecondary)
            if (state.showGrant || state.showDecline) {
                AppTextArea(
                    value = state.consentNote,
                    onValueChange = onNoteChange,
                    label = stringResource(R.string.activities_consent_note),
                    enabled = !busy,
                )
                Row(Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.spacedBy(12.dp)) {
                    if (state.showDecline) {
                        SecondaryButton(
                            text = stringResource(R.string.activities_consent_decline),
                            onClick = { onDecide(ConsentStatus.DECLINED) },
                            enabled = !busy,
                            loading = state.busyDecision == ConsentStatus.DECLINED,
                            contentColor = AppColors.Error,
                            modifier = Modifier.weight(1f),
                        )
                    }
                    if (state.showGrant) {
                        PrimaryButton(
                            text = stringResource(R.string.activities_consent_grant),
                            onClick = { onDecide(ConsentStatus.GRANTED) },
                            enabled = !busy,
                            loading = state.busyDecision == ConsentStatus.GRANTED,
                            modifier = Modifier.weight(1f),
                        )
                    }
                }
            }
        }
    }
}
