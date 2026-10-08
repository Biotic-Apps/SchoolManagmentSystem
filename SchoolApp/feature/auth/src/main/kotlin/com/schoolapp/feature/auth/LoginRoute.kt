package com.schoolapp.feature.auth

import androidx.activity.compose.BackHandler
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.remember
import androidx.compose.ui.Modifier
import androidx.hilt.lifecycle.viewmodel.compose.hiltViewModel
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import com.schoolapp.feature.auth.branding.LoginBrandingViewModel
import com.schoolapp.feature.auth.emailcode.EmailSignInActions
import com.schoolapp.feature.auth.emailcode.EmailSignInViewModel

@Composable
fun LoginRoute(
    modifier: Modifier = Modifier,
    onForgotPassword: () -> Unit = {},
    viewModel: LoginViewModel = hiltViewModel(),
    emailCodeViewModel: EmailSignInViewModel = hiltViewModel(),
    brandingViewModel: LoginBrandingViewModel = hiltViewModel(),
) {
    val state by viewModel.uiState.collectAsStateWithLifecycle()
    val emailCode by emailCodeViewModel.uiState.collectAsStateWithLifecycle()
    val brand by brandingViewModel.uiState.collectAsStateWithLifecycle()
    val actions = remember(viewModel, emailCodeViewModel, onForgotPassword) {
        LoginActions(
            onIdentifierChange = viewModel::onIdentifierChange,
            onPasswordChange = viewModel::onPasswordChange,
            onSubmit = viewModel::onSubmit,
            onForgotPassword = onForgotPassword,
            onCodeChange = viewModel::onCodeChange,
            onToggleCodeMode = viewModel::onToggleCodeMode,
            onVerify = viewModel::onVerify,
            onBackToSignIn = viewModel::onBackToSignIn,
            onUseEmailCode = emailCodeViewModel::onStart,
        )
    }
    val emailCodeActions = remember(emailCodeViewModel) {
        EmailSignInActions(
            onEmailChange = emailCodeViewModel::onEmailChange,
            onSendCode = emailCodeViewModel::onSendCode,
            onCodeChange = emailCodeViewModel::onCodeChange,
            onVerify = emailCodeViewModel::onVerify,
            onResend = emailCodeViewModel::onResend,
            onChangeEmail = emailCodeViewModel::onChangeEmail,
            onUsePassword = emailCodeViewModel::onUsePassword,
        )
    }
    // An email-code sign-in that needs 2FA continues on the shared verification step.
    LaunchedEffect(emailCode.pendingChallengeId) {
        emailCode.pendingChallengeId?.let { challengeId ->
            viewModel.onTwoFactorChallenge(challengeId)
            emailCodeViewModel.onChallengeHandled()
        }
    }
    BackHandler(enabled = emailCode.active && state.step == LoginStep.PASSWORD, onBack = emailCodeViewModel::onBack)
    LoginScreen(
        state = state,
        brand = brand,
        actions = actions,
        modifier = modifier,
        emailCode = emailCode,
        emailCodeActions = emailCodeActions,
    )
}
