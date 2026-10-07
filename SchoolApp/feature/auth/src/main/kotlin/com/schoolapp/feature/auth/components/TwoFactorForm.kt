package com.schoolapp.feature.auth.components

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.semantics.heading
import androidx.compose.ui.semantics.semantics
import androidx.compose.ui.text.input.ImeAction
import androidx.compose.ui.tooling.preview.Preview
import androidx.compose.ui.unit.dp
import com.schoolapp.core.designsystem.component.AppCard
import com.schoolapp.core.designsystem.component.AppTextButton
import com.schoolapp.core.designsystem.component.AppTextField
import com.schoolapp.core.designsystem.component.FieldKind
import com.schoolapp.core.designsystem.component.InlineMessage
import com.schoolapp.core.designsystem.component.PrimaryButton
import com.schoolapp.core.designsystem.theme.AppColors
import com.schoolapp.core.designsystem.theme.SchoolTheme
import com.schoolapp.feature.auth.LoginActions
import com.schoolapp.feature.auth.LoginStep
import com.schoolapp.feature.auth.LoginUiState
import com.schoolapp.feature.auth.R
import com.schoolapp.feature.auth.TwoFactorFieldError
import com.schoolapp.feature.auth.TwoFactorMode
import com.schoolapp.feature.auth.TwoFactorUiState

/** Second sign-in step: authenticator code, or a recovery code. */
@Composable
internal fun TwoFactorForm(state: LoginUiState, actions: LoginActions, modifier: Modifier = Modifier) {
    val twoFactor = state.twoFactor
    val recovery = twoFactor.mode == TwoFactorMode.RECOVERY
    AppCard(modifier.fillMaxWidth(), contentPadding = 24.dp) {
        Column(verticalArrangement = Arrangement.spacedBy(16.dp)) {
            Column(verticalArrangement = Arrangement.spacedBy(4.dp)) {
                Text(
                    text = stringResource(R.string.auth_two_factor_title),
                    style = MaterialTheme.typography.titleLarge,
                    color = AppColors.TextPrimary,
                    modifier = Modifier.semantics { heading() },
                )
                Text(
                    text = stringResource(
                        if (recovery) R.string.auth_two_factor_message_recovery else R.string.auth_two_factor_message_totp,
                    ),
                    style = MaterialTheme.typography.bodyMedium,
                    color = AppColors.TextSecondary,
                )
            }
            state.failure?.let { InlineMessage(text = stringResource(it.messageRes()), tone = it.tone()) }
            AppTextField(
                value = twoFactor.code,
                onValueChange = actions.onCodeChange,
                label = stringResource(if (recovery) R.string.auth_two_factor_recovery_label else R.string.auth_two_factor_code_label),
                errorText = twoFactor.codeError?.let { stringResource(it.messageRes()) },
                enabled = !state.isSubmitting,
                kind = if (recovery) FieldKind.Code else FieldKind.OneTimeCode,
                imeAction = ImeAction.Done,
                onImeAction = actions.onVerify,
            )
            PrimaryButton(
                text = stringResource(R.string.auth_two_factor_verify),
                onClick = actions.onVerify,
                loading = state.isSubmitting,
                modifier = Modifier.fillMaxWidth(),
            )
            Column(Modifier.fillMaxWidth(), horizontalAlignment = Alignment.CenterHorizontally) {
                AppTextButton(
                    text = stringResource(
                        if (recovery) R.string.auth_two_factor_use_authenticator else R.string.auth_two_factor_use_recovery,
                    ),
                    onClick = actions.onToggleCodeMode,
                    enabled = !state.isSubmitting,
                )
                AppTextButton(
                    text = stringResource(R.string.auth_back_to_sign_in),
                    onClick = actions.onBackToSignIn,
                    enabled = !state.isSubmitting,
                    contentColor = AppColors.TextSecondary,
                )
            }
        }
    }
}

@Preview
@Composable
private fun TwoFactorFormPreview() = SchoolTheme {
    TwoFactorForm(
        LoginUiState(
            step = LoginStep.TWO_FACTOR,
            twoFactor = TwoFactorUiState(code = "12 34", codeError = TwoFactorFieldError.INVALID_TOTP),
        ),
        LoginActions(),
    )
}
