package com.schoolapp.feature.auth.forgot

import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.tooling.preview.Preview
import com.schoolapp.core.designsystem.theme.SchoolTheme
import com.schoolapp.feature.auth.R
import com.schoolapp.feature.auth.components.AuthFormScaffold
import com.schoolapp.feature.auth.forgot.components.ForgotPasswordForm
import com.schoolapp.feature.auth.forgot.components.ForgotPasswordSent

@Composable
fun ForgotPasswordScreen(
    state: ForgotPasswordUiState,
    onIdentifierChange: (String) -> Unit,
    onSubmit: () -> Unit,
    onHaveResetCode: () -> Unit,
    onBackToSignIn: () -> Unit,
    modifier: Modifier = Modifier,
) {
    AuthFormScaffold(title = stringResource(R.string.auth_forgot_title), onBack = onBackToSignIn, modifier = modifier) {
        if (state.sent) {
            ForgotPasswordSent(onHaveResetCode = onHaveResetCode, onBackToSignIn = onBackToSignIn)
        } else {
            ForgotPasswordForm(state, onIdentifierChange, onSubmit, onHaveResetCode)
        }
    }
}

@Preview(showBackground = true)
@Composable
private fun ForgotPasswordScreenPreview() = SchoolTheme {
    ForgotPasswordScreen(ForgotPasswordUiState(identifier = "teacher@school.pk"), {}, {}, {}, {})
}

@Preview(showBackground = true)
@Composable
private fun ForgotPasswordSentPreview() = SchoolTheme {
    ForgotPasswordScreen(ForgotPasswordUiState(sent = true), {}, {}, {}, {})
}
