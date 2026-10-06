package com.schoolapp.feature.auth

import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.remember
import androidx.compose.ui.Modifier
import androidx.hilt.lifecycle.viewmodel.compose.hiltViewModel
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import com.schoolapp.feature.auth.branding.LoginBrandingViewModel

@Composable
fun LoginRoute(
    modifier: Modifier = Modifier,
    onForgotPassword: () -> Unit = {},
    footer: @Composable () -> Unit = {},
    viewModel: LoginViewModel = hiltViewModel(),
    brandingViewModel: LoginBrandingViewModel = hiltViewModel(),
) {
    val state by viewModel.uiState.collectAsStateWithLifecycle()
    val brand by brandingViewModel.uiState.collectAsStateWithLifecycle()
    val actions = remember(viewModel, onForgotPassword) {
        LoginActions(
            onIdentifierChange = viewModel::onIdentifierChange,
            onPasswordChange = viewModel::onPasswordChange,
            onSubmit = viewModel::onSubmit,
            onForgotPassword = onForgotPassword,
            onCodeChange = viewModel::onCodeChange,
            onToggleCodeMode = viewModel::onToggleCodeMode,
            onVerify = viewModel::onVerify,
            onBackToSignIn = viewModel::onBackToSignIn,
        )
    }
    LoginScreen(state = state, brand = brand, actions = actions, modifier = modifier, footer = footer)
}
