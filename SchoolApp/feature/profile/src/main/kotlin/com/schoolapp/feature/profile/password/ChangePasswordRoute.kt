package com.schoolapp.feature.profile.password

import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.ui.Modifier
import androidx.hilt.lifecycle.viewmodel.compose.hiltViewModel
import androidx.lifecycle.compose.collectAsStateWithLifecycle

/** From Profile: back arrow, returns when done. */
@Composable
fun ChangePasswordRoute(
    onBack: () -> Unit,
    modifier: Modifier = Modifier,
    viewModel: ChangePasswordViewModel = hiltViewModel(),
) {
    val state by viewModel.uiState.collectAsStateWithLifecycle()
    LaunchedEffect(state.done) { if (state.done) onBack() }
    ChangePasswordScreen(
        state = state,
        forced = false,
        onCurrentChange = viewModel::onCurrentChange,
        onNewChange = viewModel::onNewChange,
        onConfirmChange = viewModel::onConfirmChange,
        onSubmit = viewModel::onSubmit,
        onBack = onBack,
        modifier = modifier,
    )
}

/** First login / admin reset: no way back, only sign out. The auth state leaves this screen when done. */
@Composable
fun ForcedChangePasswordRoute(
    onSignOut: () -> Unit,
    modifier: Modifier = Modifier,
    viewModel: ChangePasswordViewModel = hiltViewModel(),
) {
    val state by viewModel.uiState.collectAsStateWithLifecycle()
    ChangePasswordScreen(
        state = state,
        forced = true,
        onCurrentChange = viewModel::onCurrentChange,
        onNewChange = viewModel::onNewChange,
        onConfirmChange = viewModel::onConfirmChange,
        onSubmit = viewModel::onSubmit,
        onBack = onSignOut,
        modifier = modifier,
    )
}
