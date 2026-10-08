package com.schoolapp.feature.auth.emailcode.components

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.semantics.heading
import androidx.compose.ui.semantics.semantics
import androidx.compose.ui.tooling.preview.Preview
import androidx.compose.ui.unit.dp
import com.schoolapp.core.designsystem.component.AppCard
import com.schoolapp.core.designsystem.component.InlineMessage
import com.schoolapp.core.designsystem.theme.AppColors
import com.schoolapp.core.designsystem.theme.SchoolTheme
import com.schoolapp.feature.auth.LoginFailure
import com.schoolapp.feature.auth.R
import com.schoolapp.feature.auth.components.messageRes
import com.schoolapp.feature.auth.components.tone
import com.schoolapp.feature.auth.emailcode.EmailSignInActions
import com.schoolapp.feature.auth.emailcode.EmailSignInUiState
import com.schoolapp.feature.auth.emailcode.EmailStep

/** Parent sign-in by emailed code: the address first, then the code. */
@Composable
internal fun EmailSignInForm(state: EmailSignInUiState, actions: EmailSignInActions, modifier: Modifier = Modifier) {
    AppCard(modifier.fillMaxWidth(), contentPadding = 24.dp) {
        Column(verticalArrangement = Arrangement.spacedBy(16.dp)) {
            Column(verticalArrangement = Arrangement.spacedBy(4.dp)) {
                Text(
                    text = stringResource(R.string.auth_email_code_title),
                    style = MaterialTheme.typography.titleLarge,
                    color = AppColors.TextPrimary,
                    modifier = Modifier.semantics { heading() },
                )
                Text(
                    text = when (state.step) {
                        EmailStep.EMAIL -> stringResource(R.string.auth_email_code_message)
                        EmailStep.CODE -> stringResource(R.string.auth_email_code_code_message, state.email.trim())
                    },
                    style = MaterialTheme.typography.bodyMedium,
                    color = AppColors.TextSecondary,
                )
            }
            state.failure?.let { InlineMessage(text = stringResource(it.messageRes()), tone = it.tone()) }
            when (state.step) {
                EmailStep.EMAIL -> EmailAddressStep(state, actions)
                EmailStep.CODE -> EmailCodeStep(state, actions)
            }
        }
    }
}

@Preview
@Composable
private fun EmailSignInFormPreview() = SchoolTheme {
    EmailSignInForm(EmailSignInUiState(active = true, email = "parent@example.com"), EmailSignInActions())
}

@Preview
@Composable
private fun EmailSignInFormCodePreview() = SchoolTheme {
    EmailSignInForm(
        EmailSignInUiState(
            active = true,
            step = EmailStep.CODE,
            email = "parent@example.com",
            resendInSeconds = 42,
            failure = LoginFailure.OTP_INVALID,
        ),
        EmailSignInActions(),
    )
}
