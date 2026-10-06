package com.schoolapp.feature.auth.forgot.components

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.text.KeyboardActions
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.autofill.ContentType
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.semantics.contentType
import androidx.compose.ui.semantics.semantics
import androidx.compose.ui.text.input.ImeAction
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.unit.dp
import com.schoolapp.core.designsystem.component.AppTextButton
import com.schoolapp.core.designsystem.component.AppTextField
import com.schoolapp.core.designsystem.component.InlineMessage
import com.schoolapp.core.designsystem.component.PrimaryButton
import com.schoolapp.core.designsystem.component.StatusTone
import com.schoolapp.core.designsystem.theme.AppColors
import com.schoolapp.core.ui.appErrorMessage
import com.schoolapp.feature.auth.R
import com.schoolapp.feature.auth.components.messageRes
import com.schoolapp.feature.auth.forgot.ForgotPasswordUiState

@Composable
internal fun ForgotPasswordForm(
    state: ForgotPasswordUiState,
    onIdentifierChange: (String) -> Unit,
    onSubmit: () -> Unit,
    onHaveResetCode: () -> Unit,
    modifier: Modifier = Modifier,
) {
    Column(modifier, verticalArrangement = Arrangement.spacedBy(16.dp)) {
        Text(
            text = stringResource(R.string.auth_forgot_message),
            style = MaterialTheme.typography.bodyMedium,
            color = AppColors.TextSecondary,
        )
        state.failure?.let { InlineMessage(appErrorMessage(it), StatusTone.Error) }
        AppTextField(
            value = state.identifier,
            onValueChange = onIdentifierChange,
            label = stringResource(R.string.auth_identifier_label),
            errorText = state.identifierError?.let { stringResource(it.messageRes()) },
            supportingText = stringResource(R.string.auth_identifier_hint),
            enabled = !state.isSubmitting,
            keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Email, imeAction = ImeAction.Send),
            keyboardActions = KeyboardActions(onSend = { onSubmit() }),
            modifier = Modifier.semantics { contentType = ContentType.Username },
        )
        PrimaryButton(
            text = stringResource(R.string.auth_forgot_submit),
            onClick = onSubmit,
            loading = state.isSubmitting,
            modifier = Modifier.fillMaxWidth(),
        )
        AppTextButton(
            text = stringResource(R.string.auth_have_reset_code),
            onClick = onHaveResetCode,
            enabled = !state.isSubmitting,
            modifier = Modifier.align(Alignment.CenterHorizontally),
        )
    }
}
