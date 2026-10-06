package com.schoolapp.feature.auth.reset

import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.tooling.preview.Preview
import com.schoolapp.core.designsystem.theme.SchoolTheme
import com.schoolapp.feature.auth.R
import com.schoolapp.feature.auth.components.AuthFormScaffold
import com.schoolapp.feature.auth.reset.components.ResetPasswordDone
import com.schoolapp.feature.auth.reset.components.ResetPasswordForm

@Composable
fun ResetPasswordScreen(
    state: ResetPasswordUiState,
    onTokenChange: (String) -> Unit,
    onNewChange: (String) -> Unit,
    onConfirmChange: (String) -> Unit,
    onSubmit: () -> Unit,
    onBack: () -> Unit,
    onBackToSignIn: () -> Unit,
    modifier: Modifier = Modifier,
) {
    AuthFormScaffold(title = stringResource(R.string.auth_reset_title), onBack = onBack, modifier = modifier) {
        if (state.done) {
            ResetPasswordDone(onBackToSignIn)
        } else {
            ResetPasswordForm(state, onTokenChange, onNewChange, onConfirmChange, onSubmit)
        }
    }
}

@Preview(showBackground = true)
@Composable
private fun ResetPasswordScreenPreview() = SchoolTheme {
    ResetPasswordScreen(
        state = ResetPasswordUiState(failure = ResetFailure.InvalidCode, confirmError = ResetFieldError.MISMATCH),
        onTokenChange = {}, onNewChange = {}, onConfirmChange = {}, onSubmit = {}, onBack = {}, onBackToSignIn = {},
    )
}

@Preview(showBackground = true)
@Composable
private fun ResetPasswordDonePreview() = SchoolTheme {
    ResetPasswordScreen(
        state = ResetPasswordUiState(done = true),
        onTokenChange = {}, onNewChange = {}, onConfirmChange = {}, onSubmit = {}, onBack = {}, onBackToSignIn = {},
    )
}
