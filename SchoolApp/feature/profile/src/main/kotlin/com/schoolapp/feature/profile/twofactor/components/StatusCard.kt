package com.schoolapp.feature.profile.twofactor.components

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.outlined.Key
import androidx.compose.material.icons.outlined.LockOpen
import androidx.compose.material.icons.outlined.VerifiedUser
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.unit.dp
import com.schoolapp.core.designsystem.component.AppCard
import com.schoolapp.core.designsystem.component.InlineMessage
import com.schoolapp.core.designsystem.component.PrimaryButton
import com.schoolapp.core.designsystem.component.SecondaryButton
import com.schoolapp.core.designsystem.component.SectionHeader
import com.schoolapp.core.designsystem.component.StatusChip
import com.schoolapp.core.designsystem.component.StatusTone
import com.schoolapp.core.designsystem.theme.AppColors
import com.schoolapp.feature.profile.R
import com.schoolapp.feature.profile.twofactor.TwoFactorUiState

/** On/Off status, the school-policy warning and the actions available in the current state. */
@Composable
internal fun StatusCard(
    state: TwoFactorUiState,
    onStartSetup: () -> Unit,
    onRegenerate: () -> Unit,
    onDisable: () -> Unit,
    modifier: Modifier = Modifier,
) {
    AppCard(modifier.fillMaxWidth()) {
        Column(verticalArrangement = Arrangement.spacedBy(12.dp)) {
            SectionHeader(
                title = stringResource(R.string.two_factor_title),
                action = {
                    StatusChip(
                        text = stringResource(if (state.enabled) R.string.profile_two_factor_on else R.string.profile_two_factor_off),
                        tone = if (state.enabled) StatusTone.Success else StatusTone.Neutral,
                    )
                },
            )
            Text(
                text = stringResource(if (state.enabled) R.string.two_factor_on_body else R.string.two_factor_off_body),
                style = MaterialTheme.typography.bodyMedium,
                color = AppColors.TextSecondary,
            )
            if (state.required && !state.enabled) {
                InlineMessage(stringResource(R.string.two_factor_required_warning), StatusTone.Warning)
            }
            if (state.required && state.enabled) {
                InlineMessage(stringResource(R.string.two_factor_required_on), StatusTone.Info)
            }
            if (state.setup == null) {
                state.actionError?.let { InlineMessage(twoFactorErrorMessage(it), StatusTone.Error) }
            }
            when {
                !state.enabled && state.setup == null -> PrimaryButton(
                    text = stringResource(R.string.two_factor_set_up),
                    onClick = onStartSetup,
                    loading = state.isStarting,
                    leadingIcon = Icons.Outlined.VerifiedUser,
                    modifier = Modifier.fillMaxWidth(),
                )
                state.enabled -> {
                    SecondaryButton(
                        text = stringResource(R.string.two_factor_regenerate),
                        onClick = onRegenerate,
                        leadingIcon = Icons.Outlined.Key,
                        modifier = Modifier.fillMaxWidth(),
                    )
                    if (!state.required) {
                        SecondaryButton(
                            text = stringResource(R.string.two_factor_turn_off),
                            onClick = onDisable,
                            leadingIcon = Icons.Outlined.LockOpen,
                            contentColor = AppColors.Error,
                            modifier = Modifier.fillMaxWidth(),
                        )
                    }
                }
            }
        }
    }
}
