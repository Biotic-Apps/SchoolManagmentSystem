package com.schoolapp.feature.profile.twofactor.components

import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.text.input.ImeAction
import com.schoolapp.core.designsystem.component.AppBottomSheet
import com.schoolapp.core.designsystem.component.AppTextField
import com.schoolapp.core.designsystem.component.ConfirmDialog
import com.schoolapp.core.designsystem.component.FieldKind
import com.schoolapp.core.designsystem.component.InlineMessage
import com.schoolapp.core.designsystem.component.PasswordField
import com.schoolapp.core.designsystem.component.PrimaryButton
import com.schoolapp.core.designsystem.component.StatusTone
import com.schoolapp.core.designsystem.theme.AppColors
import com.schoolapp.feature.profile.R
import com.schoolapp.feature.profile.twofactor.TwoFactorDialogKind
import com.schoolapp.feature.profile.twofactor.TwoFactorDialogState

/** Asks for a current code (and the password, to turn off) before regenerating codes or turning 2FA off. */
@Composable
internal fun CodeSheet(
    state: TwoFactorDialogState,
    onPasswordChange: (String) -> Unit,
    onCodeChange: (String) -> Unit,
    onSubmit: () -> Unit,
    onConfirm: () -> Unit,
    onConfirmDismiss: () -> Unit,
    onDismiss: () -> Unit,
) {
    val isDisable = state.kind == TwoFactorDialogKind.DISABLE
    AppBottomSheet(
        title = stringResource(if (isDisable) R.string.two_factor_disable_title else R.string.two_factor_regenerate_title),
        onDismiss = onDismiss,
    ) {
        Text(
            text = stringResource(if (isDisable) R.string.two_factor_disable_body else R.string.two_factor_regenerate_body),
            style = MaterialTheme.typography.bodyMedium,
            color = AppColors.TextSecondary,
        )
        if (state.wrongCredentials) InlineMessage(stringResource(R.string.two_factor_error_wrong_credentials), StatusTone.Error)
        state.failure?.let { InlineMessage(twoFactorErrorMessage(it), StatusTone.Error) }
        if (isDisable) {
            PasswordField(
                value = state.password,
                onValueChange = onPasswordChange,
                label = stringResource(R.string.two_factor_password),
                errorText = if (state.passwordMissing) stringResource(R.string.two_factor_error_password) else null,
                enabled = !state.isSubmitting,
                imeAction = ImeAction.Next,
            )
        }
        AppTextField(
            value = state.code,
            onValueChange = onCodeChange,
            label = stringResource(if (isDisable) R.string.two_factor_code_or_recovery else R.string.two_factor_code_label),
            errorText = state.codeError?.let { stringResource(it.messageRes()) },
            enabled = !state.isSubmitting,
            kind = if (isDisable) FieldKind.Code else FieldKind.Number,
            imeAction = ImeAction.Done,
            onImeAction = onSubmit,
        )
        PrimaryButton(
            text = stringResource(if (isDisable) R.string.two_factor_turn_off else R.string.two_factor_regenerate_submit),
            onClick = onSubmit,
            loading = state.isSubmitting,
            modifier = Modifier.fillMaxWidth(),
        )
    }
    if (state.confirming) {
        ConfirmDialog(
            title = stringResource(R.string.two_factor_disable_confirm_title),
            message = stringResource(R.string.two_factor_disable_confirm_message),
            confirmLabel = stringResource(R.string.two_factor_turn_off),
            onConfirm = onConfirm,
            onDismiss = onConfirmDismiss,
            destructive = true,
        )
    }
}
