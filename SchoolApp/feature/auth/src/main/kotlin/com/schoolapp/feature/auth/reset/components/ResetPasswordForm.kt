package com.schoolapp.feature.auth.reset.components

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.text.input.ImeAction
import androidx.compose.ui.unit.dp
import com.schoolapp.core.designsystem.component.AppTextField
import com.schoolapp.core.designsystem.component.FieldKind
import com.schoolapp.core.designsystem.component.InlineMessage
import com.schoolapp.core.designsystem.component.PasswordField
import com.schoolapp.core.designsystem.component.PrimaryButton
import com.schoolapp.core.designsystem.component.StatusTone
import com.schoolapp.core.designsystem.theme.AppColors
import com.schoolapp.feature.auth.R
import com.schoolapp.feature.auth.reset.ResetPasswordUiState

@Composable
internal fun ResetPasswordForm(
    state: ResetPasswordUiState,
    onTokenChange: (String) -> Unit,
    onNewChange: (String) -> Unit,
    onConfirmChange: (String) -> Unit,
    onSubmit: () -> Unit,
    modifier: Modifier = Modifier,
) {
    Column(modifier, verticalArrangement = Arrangement.spacedBy(16.dp)) {
        Text(
            text = stringResource(R.string.auth_reset_message),
            style = MaterialTheme.typography.bodyMedium,
            color = AppColors.TextSecondary,
        )
        state.failure?.let { InlineMessage(resetFailureMessage(it), StatusTone.Error) }
        AppTextField(
            value = state.token,
            onValueChange = onTokenChange,
            label = stringResource(R.string.auth_reset_code_label),
            errorText = state.tokenError?.let { stringResource(it.messageRes()) },
            supportingText = stringResource(R.string.auth_reset_code_hint),
            enabled = !state.isSubmitting,
            kind = FieldKind.Code,
        )
        PasswordField(
            value = state.newPassword,
            onValueChange = onNewChange,
            label = stringResource(R.string.auth_reset_new),
            errorText = state.newError?.let { stringResource(it.messageRes()) },
            enabled = !state.isSubmitting,
            imeAction = ImeAction.Next,
            kind = FieldKind.NewPassword,
        )
        PasswordField(
            value = state.confirm,
            onValueChange = onConfirmChange,
            label = stringResource(R.string.auth_reset_confirm),
            errorText = state.confirmError?.let { stringResource(it.messageRes()) },
            enabled = !state.isSubmitting,
            onImeAction = onSubmit,
            kind = FieldKind.NewPassword,
        )
        PrimaryButton(
            text = stringResource(R.string.auth_reset_submit),
            onClick = onSubmit,
            loading = state.isSubmitting,
            modifier = Modifier.fillMaxWidth(),
        )
    }
}
