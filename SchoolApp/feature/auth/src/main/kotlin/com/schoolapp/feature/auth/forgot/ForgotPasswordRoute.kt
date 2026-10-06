package com.schoolapp.feature.auth.forgot

import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.ui.Modifier
import androidx.hilt.lifecycle.viewmodel.compose.hiltViewModel
import androidx.lifecycle.compose.collectAsStateWithLifecycle

@Composable
fun ForgotPasswordRoute(
    onBackToSignIn: () -> Unit,
    onHaveResetCode: () -> Unit,
    modifier: Modifier = Modifier,
    viewModel: ForgotPasswordViewModel = hiltViewModel(),
) {
    val state by viewModel.uiState.collectAsStateWithLifecycle()
    ForgotPasswordScreen(
        state = state,
        onIdentifierChange = viewModel::onIdentifierChange,
        onSubmit = viewModel::onSubmit,
        onHaveResetCode = onHaveResetCode,
        onBackToSignIn = onBackToSignIn,
        modifier = modifier,
    )
}
