package com.schoolapp.feature.profile.twofactor

import androidx.compose.material3.SnackbarHostState
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.remember
import androidx.compose.runtime.rememberCoroutineScope
import androidx.compose.ui.Modifier
import androidx.compose.ui.res.stringResource
import androidx.hilt.lifecycle.viewmodel.compose.hiltViewModel
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import com.schoolapp.feature.profile.R
import kotlinx.coroutines.launch

/** Two-step sign-in (TOTP) management, opened from Profile > Security. */
@Composable
fun TwoFactorRoute(
    onBack: () -> Unit,
    modifier: Modifier = Modifier,
    viewModel: TwoFactorViewModel = hiltViewModel(),
) {
    val state by viewModel.uiState.collectAsStateWithLifecycle()
    val snackbar = remember { SnackbarHostState() }
    val scope = rememberCoroutineScope()
    val enabledText = stringResource(R.string.two_factor_enabled)
    val disabledText = stringResource(R.string.two_factor_disabled)
    val regeneratedText = stringResource(R.string.two_factor_regenerated)
    LaunchedEffect(state.notice) {
        val notice = state.notice ?: return@LaunchedEffect
        viewModel.onNoticeShown()
        val text = when (notice) {
            TwoFactorNotice.ENABLED -> enabledText
            TwoFactorNotice.DISABLED -> disabledText
            TwoFactorNotice.REGENERATED -> regeneratedText
        }
        snackbar.showSnackbar(text)
    }
    val callbacks = remember(viewModel, onBack) {
        TwoFactorCallbacks(
            onBack = onBack,
            onRetry = viewModel::load,
            onStartSetup = viewModel::onStartSetup,
            onCancelSetup = viewModel::onCancelSetup,
            onCodeChange = viewModel::onCodeChange,
            onEnable = viewModel::onEnable,
            onCodesSaved = viewModel::onRecoveryCodesSaved,
            onOpenDialog = viewModel::openDialog,
            onCloseDialog = viewModel::closeDialog,
            onDialogPasswordChange = viewModel::onDialogPasswordChange,
            onDialogCodeChange = viewModel::onDialogCodeChange,
            onDialogSubmit = viewModel::onDialogSubmit,
            onDialogConfirm = viewModel::onDialogConfirm,
            onDialogConfirmDismiss = viewModel::onDialogConfirmDismiss,
            onMessage = { text ->
                scope.launch {
                    snackbar.currentSnackbarData?.dismiss()
                    snackbar.showSnackbar(text)
                }
            },
        )
    }
    TwoFactorScreen(state = state, callbacks = callbacks, snackbarHostState = snackbar, modifier = modifier)
}
