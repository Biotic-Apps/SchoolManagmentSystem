package com.schoolapp.feature.auth.reset

import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.ui.Modifier
import androidx.hilt.lifecycle.viewmodel.compose.hiltViewModel
import androidx.lifecycle.compose.collectAsStateWithLifecycle

@Composable
fun ResetPasswordRoute(
    onBack: () -> Unit,
    onBackToSignIn: () -> Unit,
    modifier: Modifier = Modifier,
    viewModel: ResetPasswordViewModel = hiltViewModel(),
) {
    val state by viewModel.uiState.collectAsStateWithLifecycle()
    ResetPasswordScreen(
        state = state,
        onTokenChange = viewModel::onTokenChange,
        onNewChange = viewModel::onNewChange,
        onConfirmChange = viewModel::onConfirmChange,
        onSubmit = viewModel::onSubmit,
        onBack = if (state.done) onBackToSignIn else onBack,
        onBackToSignIn = onBackToSignIn,
        modifier = modifier,
    )
}
