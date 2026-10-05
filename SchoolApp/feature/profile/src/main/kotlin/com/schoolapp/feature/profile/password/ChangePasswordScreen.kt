package com.schoolapp.feature.profile.password

import androidx.compose.foundation.layout.imePadding
import androidx.compose.foundation.layout.padding
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.tooling.preview.Preview
import com.schoolapp.core.designsystem.component.AppScaffold
import com.schoolapp.core.designsystem.component.AppTextButton
import com.schoolapp.core.designsystem.component.AppTopBar
import com.schoolapp.core.designsystem.component.BackButton
import com.schoolapp.core.designsystem.component.ScreenColumn
import com.schoolapp.core.designsystem.theme.SchoolTheme
import com.schoolapp.feature.profile.R
import com.schoolapp.feature.profile.password.components.ChangePasswordForm

@Composable
fun ChangePasswordScreen(
    state: ChangePasswordUiState,
    forced: Boolean,
    onCurrentChange: (String) -> Unit,
    onNewChange: (String) -> Unit,
    onConfirmChange: (String) -> Unit,
    onSubmit: () -> Unit,
    onBack: () -> Unit,
    modifier: Modifier = Modifier,
) {
    AppScaffold(
        modifier = modifier,
        topBar = {
            AppTopBar(
                title = stringResource(R.string.password_title),
                navigationIcon = { if (!forced) BackButton(onBack) },
                actions = {
                    if (forced) AppTextButton(text = stringResource(R.string.password_sign_out), onClick = onBack)
                },
            )
        },
    ) { padding ->
        ScreenColumn(Modifier.padding(padding).imePadding()) {
            item { ChangePasswordForm(state, forced, onCurrentChange, onNewChange, onConfirmChange, onSubmit) }
        }
    }
}

@Preview(showBackground = true)
@Composable
private fun ChangePasswordScreenPreview() = SchoolTheme {
    ChangePasswordScreen(
        state = ChangePasswordUiState(newError = PasswordFieldError.NEEDS_LETTER_AND_DIGIT),
        forced = true,
        onCurrentChange = {}, onNewChange = {}, onConfirmChange = {}, onSubmit = {}, onBack = {},
    )
}
