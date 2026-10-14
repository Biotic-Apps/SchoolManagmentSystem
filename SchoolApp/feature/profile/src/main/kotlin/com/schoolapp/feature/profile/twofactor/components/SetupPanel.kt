package com.schoolapp.feature.profile.twofactor.components

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.BoxWithConstraints
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.text.input.ImeAction
import androidx.compose.ui.unit.dp
import com.schoolapp.core.designsystem.component.AppCard
import com.schoolapp.core.designsystem.component.AppTextField
import com.schoolapp.core.designsystem.component.FieldKind
import com.schoolapp.core.designsystem.component.InlineMessage
import com.schoolapp.core.designsystem.component.PrimaryButton
import com.schoolapp.core.designsystem.component.SecondaryButton
import com.schoolapp.core.designsystem.component.SectionHeader
import com.schoolapp.core.designsystem.component.StatusTone
import com.schoolapp.core.designsystem.theme.AppColors
import com.schoolapp.core.ui.appErrorMessage
import com.schoolapp.feature.profile.R
import com.schoolapp.feature.profile.twofactor.TwoFactorUiState

/** Steps, QR code + key (side by side on wide windows), then the 6-digit code with Turn on / Cancel. */
@Composable
internal fun SetupPanel(
    state: TwoFactorUiState,
    onCodeChange: (String) -> Unit,
    onEnable: () -> Unit,
    onCancel: () -> Unit,
    onMessage: (String) -> Unit,
    modifier: Modifier = Modifier,
) {
    val setup = state.setup ?: return
    AppCard(modifier.fillMaxWidth()) {
        Column(verticalArrangement = Arrangement.spacedBy(12.dp)) {
            SectionHeader(title = stringResource(R.string.two_factor_setup_title))
            listOf(R.string.two_factor_step_1, R.string.two_factor_step_2, R.string.two_factor_step_3).forEach {
                Text(stringResource(it), style = MaterialTheme.typography.bodyMedium, color = AppColors.TextPrimary)
            }
            val qrDescription = stringResource(R.string.two_factor_qr_description)
            BoxWithConstraints(Modifier.fillMaxWidth()) {
                if (maxWidth >= WIDE) {
                    Row(horizontalArrangement = Arrangement.spacedBy(16.dp), verticalAlignment = Alignment.CenterVertically) {
                        QrCodeImage(setup.otpauthUrl, qrDescription)
                        SetupKeyBlock(setup, onMessage, Modifier.weight(1f))
                    }
                } else {
                    Column(verticalArrangement = Arrangement.spacedBy(12.dp), horizontalAlignment = Alignment.CenterHorizontally) {
                        QrCodeImage(setup.otpauthUrl, qrDescription)
                        SetupKeyBlock(setup, onMessage, Modifier.fillMaxWidth())
                    }
                }
            }
            state.actionError?.let { InlineMessage(appErrorMessage(it), StatusTone.Error) }
            AppTextField(
                value = state.code,
                onValueChange = onCodeChange,
                label = stringResource(R.string.two_factor_code_label),
                errorText = state.codeError?.let { stringResource(it.messageRes()) },
                enabled = !state.isEnabling,
                kind = FieldKind.Number,
                imeAction = ImeAction.Done,
                onImeAction = onEnable,
            )
            PrimaryButton(
                text = stringResource(R.string.two_factor_turn_on),
                onClick = onEnable,
                loading = state.isEnabling,
                modifier = Modifier.fillMaxWidth(),
            )
            SecondaryButton(
                text = stringResource(R.string.two_factor_cancel),
                onClick = onCancel,
                enabled = !state.isEnabling,
                modifier = Modifier.fillMaxWidth(),
            )
        }
    }
}

private val WIDE = 560.dp
