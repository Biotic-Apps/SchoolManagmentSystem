package com.schoolapp.feature.auth.components

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.relocation.BringIntoViewRequester
import androidx.compose.foundation.relocation.bringIntoViewRequester
import androidx.compose.runtime.Composable
import androidx.compose.runtime.remember
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.tooling.preview.Preview
import androidx.compose.ui.unit.dp
import com.schoolapp.core.designsystem.component.AppCard
import com.schoolapp.core.designsystem.component.AppTextButton
import com.schoolapp.core.designsystem.component.AppTextField
import com.schoolapp.core.designsystem.component.FieldKind
import com.schoolapp.core.designsystem.component.InlineMessage
import com.schoolapp.core.designsystem.component.PasswordField
import com.schoolapp.core.designsystem.component.PrimaryButton
import com.schoolapp.core.designsystem.component.revealOnFocus
import com.schoolapp.core.designsystem.theme.SchoolTheme
import com.schoolapp.feature.auth.LoginActions
import com.schoolapp.feature.auth.LoginFailure
import com.schoolapp.feature.auth.LoginUiState
import com.schoolapp.feature.auth.R

/** One sign-in form for staff and parents: identifier, password, sign in. */
@Composable
internal fun LoginForm(state: LoginUiState, actions: LoginActions, modifier: Modifier = Modifier) {
    val signInButton = remember { BringIntoViewRequester() }
    AppCard(modifier.fillMaxWidth(), contentPadding = 24.dp) {
        Column(verticalArrangement = Arrangement.spacedBy(16.dp)) {
            state.failure?.let { InlineMessage(text = stringResource(it.messageRes()), tone = it.tone()) }
            AppTextField(
                value = state.identifier,
                onValueChange = actions.onIdentifierChange,
                label = stringResource(R.string.auth_identifier_label_any),
                errorText = state.identifierError?.let { stringResource(it.messageRes()) },
                enabled = !state.isSubmitting,
                kind = FieldKind.Username,
                modifier = Modifier.revealOnFocus(signInButton),
            )
            Column(verticalArrangement = Arrangement.spacedBy(4.dp)) {
                PasswordField(
                    value = state.password,
                    onValueChange = actions.onPasswordChange,
                    label = stringResource(R.string.auth_password_label),
                    errorText = state.passwordError?.let { stringResource(it.messageRes()) },
                    enabled = !state.isSubmitting,
                    onImeAction = actions.onSubmit,
                    modifier = Modifier.revealOnFocus(signInButton),
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
                modifier = Modifier.fillMaxWidth().bringIntoViewRequester(signInButton),
            )
            AppTextButton(
                text = stringResource(R.string.auth_use_email_code),
                onClick = actions.onUseEmailCode,
                enabled = !state.isSubmitting,
                modifier = Modifier.align(Alignment.CenterHorizontally),
            )
        }
    }
}

@Preview
@Composable
private fun LoginFormPreview() = SchoolTheme {
    LoginForm(LoginUiState(failure = LoginFailure.NETWORK, isSubmitting = true), LoginActions())
}
