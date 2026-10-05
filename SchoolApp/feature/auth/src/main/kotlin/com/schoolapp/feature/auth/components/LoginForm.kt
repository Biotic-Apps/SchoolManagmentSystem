package com.schoolapp.feature.auth.components

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.text.KeyboardActions
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.autofill.ContentType
import androidx.compose.ui.focus.FocusDirection
import androidx.compose.ui.platform.LocalFocusManager
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.semantics.contentType
import androidx.compose.ui.semantics.semantics
import androidx.compose.ui.text.input.ImeAction
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.tooling.preview.Preview
import androidx.compose.ui.unit.dp
import com.schoolapp.core.designsystem.component.AppCard
import com.schoolapp.core.designsystem.component.AppTextField
import com.schoolapp.core.designsystem.component.InlineMessage
import com.schoolapp.core.designsystem.component.PasswordField
import com.schoolapp.core.designsystem.component.PrimaryButton
import com.schoolapp.core.designsystem.component.StatusTone
import com.schoolapp.core.designsystem.theme.SchoolTheme
import com.schoolapp.feature.auth.LoginFailure
import com.schoolapp.feature.auth.LoginUiState
import com.schoolapp.feature.auth.R

@Composable
internal fun LoginForm(
    state: LoginUiState,
    onIdentifierChange: (String) -> Unit,
    onPasswordChange: (String) -> Unit,
    onSubmit: () -> Unit,
    modifier: Modifier = Modifier,
) {
    val focusManager = LocalFocusManager.current
    AppCard(modifier.fillMaxWidth(), contentPadding = 24.dp) {
        Column(verticalArrangement = Arrangement.spacedBy(16.dp)) {
            state.failure?.let { InlineMessage(text = stringResource(it.messageRes()), tone = StatusTone.Error) }
            AppTextField(
                value = state.identifier,
                onValueChange = onIdentifierChange,
                label = stringResource(R.string.auth_identifier_label),
                errorText = state.identifierError?.let { stringResource(it.messageRes()) },
                supportingText = stringResource(R.string.auth_identifier_hint),
                enabled = !state.isSubmitting,
                keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Email, imeAction = ImeAction.Next),
                keyboardActions = KeyboardActions(onNext = { focusManager.moveFocus(FocusDirection.Down) }),
                modifier = Modifier.semantics { contentType = ContentType.Username },
            )
            PasswordField(
                value = state.password,
                onValueChange = onPasswordChange,
                label = stringResource(R.string.auth_password_label),
                errorText = state.passwordError?.let { stringResource(it.messageRes()) },
                enabled = !state.isSubmitting,
                onImeAction = onSubmit,
                modifier = Modifier.semantics { contentType = ContentType.Password },
            )
            PrimaryButton(
                text = stringResource(R.string.auth_sign_in),
                onClick = onSubmit,
                loading = state.isSubmitting,
                modifier = Modifier.fillMaxWidth(),
            )
        }
    }
}

@Preview
@Composable
private fun LoginFormPreview() = SchoolTheme {
    LoginForm(LoginUiState(failure = LoginFailure.NETWORK, isSubmitting = true), {}, {}, {})
}
