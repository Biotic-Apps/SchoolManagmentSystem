package com.schoolapp.feature.auth.components

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.text.KeyboardActions
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
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
import com.schoolapp.core.designsystem.component.AppTextButton
import com.schoolapp.core.designsystem.component.AppTextField
import com.schoolapp.core.designsystem.component.InlineMessage
import com.schoolapp.core.designsystem.component.PasswordField
import com.schoolapp.core.designsystem.component.PrimaryButton
import com.schoolapp.core.designsystem.theme.SchoolTheme
import com.schoolapp.feature.auth.LoginActions
import com.schoolapp.feature.auth.LoginFailure
import com.schoolapp.feature.auth.LoginUiState
import com.schoolapp.feature.auth.R

@Composable
internal fun LoginForm(state: LoginUiState, actions: LoginActions, modifier: Modifier = Modifier) {
    val focusManager = LocalFocusManager.current
    AppCard(modifier.fillMaxWidth(), contentPadding = 24.dp) {
        Column(verticalArrangement = Arrangement.spacedBy(16.dp)) {
            state.failure?.let { InlineMessage(text = stringResource(it.messageRes()), tone = it.tone()) }
            AppTextField(
                value = state.identifier,
                onValueChange = actions.onIdentifierChange,
                label = stringResource(R.string.auth_identifier_label),
                errorText = state.identifierError?.let { stringResource(it.messageRes()) },
                supportingText = stringResource(R.string.auth_identifier_hint),
                enabled = !state.isSubmitting,
                keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Email, imeAction = ImeAction.Next),
                keyboardActions = KeyboardActions(onNext = { focusManager.moveFocus(FocusDirection.Down) }),
                modifier = Modifier.semantics { contentType = ContentType.Username },
            )
            Column(verticalArrangement = Arrangement.spacedBy(4.dp)) {
                PasswordField(
                    value = state.password,
                    onValueChange = actions.onPasswordChange,
                    label = stringResource(R.string.auth_password_label),
                    errorText = state.passwordError?.let { stringResource(it.messageRes()) },
                    enabled = !state.isSubmitting,
                    onImeAction = actions.onSubmit,
                    modifier = Modifier.semantics { contentType = ContentType.Password },
                )
                AppTextButton(
                    text = stringResource(R.string.auth_forgot_password),
                    onClick = actions.onForgotPassword,
                    enabled = !state.isSubmitting,
                    modifier = Modifier.align(Alignment.End),
                )
            }
            PrimaryButton(
                text = stringResource(R.string.auth_sign_in),
                onClick = actions.onSubmit,
                loading = state.isSubmitting,
                modifier = Modifier.fillMaxWidth(),
            )
        }
    }
}

@Preview
@Composable
private fun LoginFormPreview() = SchoolTheme {
    LoginForm(LoginUiState(failure = LoginFailure.NETWORK, isSubmitting = true), LoginActions())
}
