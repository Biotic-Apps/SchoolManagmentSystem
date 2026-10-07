package com.schoolapp.feature.auth.phone.components

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
import com.schoolapp.feature.auth.phone.PhoneSignInActions
import com.schoolapp.feature.auth.phone.PhoneSignInUiState
import com.schoolapp.feature.auth.phone.PhoneStep

/** Parent sign-in by texted code: the number first, then the code. */
@Composable
internal fun PhoneSignInForm(state: PhoneSignInUiState, actions: PhoneSignInActions, modifier: Modifier = Modifier) {
    AppCard(modifier.fillMaxWidth(), contentPadding = 24.dp) {
        Column(verticalArrangement = Arrangement.spacedBy(16.dp)) {
            Column(verticalArrangement = Arrangement.spacedBy(4.dp)) {
                Text(
                    text = stringResource(R.string.auth_phone_title),
                    style = MaterialTheme.typography.titleLarge,
                    color = AppColors.TextPrimary,
                    modifier = Modifier.semantics { heading() },
                )
                Text(
                    text = when (state.step) {
                        PhoneStep.PHONE -> stringResource(R.string.auth_phone_message)
                        PhoneStep.CODE -> stringResource(R.string.auth_phone_code_message, state.phone.trim())
                    },
                    style = MaterialTheme.typography.bodyMedium,
                    color = AppColors.TextSecondary,
                )
            }
            state.failure?.let { InlineMessage(text = stringResource(it.messageRes()), tone = it.tone()) }
            when (state.step) {
                PhoneStep.PHONE -> PhoneNumberStep(state, actions)
                PhoneStep.CODE -> PhoneCodeStep(state, actions)
            }
        }
    }
}

@Preview
@Composable
private fun PhoneSignInFormPreview() = SchoolTheme {
    PhoneSignInForm(PhoneSignInUiState(active = true, phone = "0300 1234567"), PhoneSignInActions())
}

@Preview
@Composable
private fun PhoneSignInFormCodePreview() = SchoolTheme {
    PhoneSignInForm(
        PhoneSignInUiState(
            active = true,
            step = PhoneStep.CODE,
            phone = "0300 1234567",
            resendInSeconds = 42,
            failure = LoginFailure.OTP_INVALID,
        ),
        PhoneSignInActions(),
    )
}
