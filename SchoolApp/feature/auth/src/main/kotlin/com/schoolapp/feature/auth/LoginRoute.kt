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
import com.schoolapp.feature.auth.phone.PhoneSignInActions
import com.schoolapp.feature.auth.phone.PhoneSignInViewModel

@Composable
fun LoginRoute(
    modifier: Modifier = Modifier,
    onForgotPassword: () -> Unit = {},
    footer: @Composable () -> Unit = {},
    viewModel: LoginViewModel = hiltViewModel(),
    phoneViewModel: PhoneSignInViewModel = hiltViewModel(),
    brandingViewModel: LoginBrandingViewModel = hiltViewModel(),
) {
    val state by viewModel.uiState.collectAsStateWithLifecycle()
    val phone by phoneViewModel.uiState.collectAsStateWithLifecycle()
    val brand by brandingViewModel.uiState.collectAsStateWithLifecycle()
    val actions = remember(viewModel, phoneViewModel, onForgotPassword) {
        LoginActions(
            onIdentifierChange = viewModel::onIdentifierChange,
            onPasswordChange = viewModel::onPasswordChange,
            onSubmit = viewModel::onSubmit,
            onForgotPassword = onForgotPassword,
            onCodeChange = viewModel::onCodeChange,
            onToggleCodeMode = viewModel::onToggleCodeMode,
            onVerify = viewModel::onVerify,
            onBackToSignIn = viewModel::onBackToSignIn,
            onUsePhoneCode = phoneViewModel::onStart,
        )
    }
    val phoneActions = remember(phoneViewModel) {
        PhoneSignInActions(
            onPhoneChange = phoneViewModel::onPhoneChange,
            onSendCode = phoneViewModel::onSendCode,
            onCodeChange = phoneViewModel::onCodeChange,
            onVerify = phoneViewModel::onVerify,
            onResend = phoneViewModel::onResend,
            onChangeNumber = phoneViewModel::onChangeNumber,
            onUsePassword = phoneViewModel::onUsePassword,
        )
    }
    // A phone sign-in that needs 2FA continues on the shared verification step.
    LaunchedEffect(phone.pendingChallengeId) {
        phone.pendingChallengeId?.let { challengeId ->
            viewModel.onTwoFactorChallenge(challengeId)
            phoneViewModel.onChallengeHandled()
        }
    }
    BackHandler(enabled = phone.active && state.step == LoginStep.PASSWORD, onBack = phoneViewModel::onBack)
    LoginScreen(
        state = state,
        brand = brand,
        actions = actions,
        modifier = modifier,
        phone = phone,
        phoneActions = phoneActions,
        footer = footer,
    )
}
