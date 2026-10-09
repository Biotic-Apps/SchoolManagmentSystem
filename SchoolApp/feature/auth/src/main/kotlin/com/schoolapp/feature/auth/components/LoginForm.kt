package com.schoolapp.feature.auth.components

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.relocation.BringIntoViewRequester
import androidx.compose.foundation.relocation.bringIntoViewRequester
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.saveable.rememberSaveable
import androidx.compose.runtime.setValue
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
import com.schoolapp.core.designsystem.component.SegmentedChoice
import com.schoolapp.core.designsystem.component.revealOnFocus
import com.schoolapp.core.designsystem.theme.AppColors
import com.schoolapp.core.designsystem.theme.SchoolTheme
import com.schoolapp.feature.auth.LoginActions
import com.schoolapp.feature.auth.LoginFailure
import com.schoolapp.feature.auth.LoginUiState
import com.schoolapp.feature.auth.R

/** Staff / Parent switch (labels only, defaults to Staff, not persisted), identifier, password, sign in. */
@Composable
internal fun LoginForm(state: LoginUiState, actions: LoginActions, modifier: Modifier = Modifier) {
    val signInButton = remember { BringIntoViewRequester() }
    var audience by rememberSaveable { mutableStateOf(LoginAudience.STAFF) }
    AppCard(modifier.fillMaxWidth(), contentPadding = 24.dp) {
        Column(verticalArrangement = Arrangement.spacedBy(16.dp)) {
            state.failure?.let { InlineMessage(text = stringResource(it.messageRes()), tone = it.tone()) }
            SegmentedChoice(
                labels = LoginAudience.entries.map { stringResource(it.tabRes) },
                selectedIndex = audience.ordinal,
                onSelect = { audience = LoginAudience.entries[it] },
            )
            AppTextField(
                value = state.identifier,
                onValueChange = actions.onIdentifierChange,
                label = stringResource(audience.identifierLabelRes),
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
                if (audience == LoginAudience.PARENT) {
                    Text(
                        text = stringResource(R.string.auth_parent_password_help),
                        style = MaterialTheme.typography.bodySmall,
                        color = AppColors.TextSecondary,
                        modifier = Modifier.align(Alignment.End),
                    )
                }
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
