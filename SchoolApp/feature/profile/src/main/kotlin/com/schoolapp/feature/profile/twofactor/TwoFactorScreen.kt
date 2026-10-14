package com.schoolapp.feature.profile.twofactor

import androidx.compose.foundation.layout.padding
import androidx.compose.material3.SnackbarHostState
import androidx.compose.runtime.Composable
import androidx.compose.runtime.remember
import androidx.compose.ui.Modifier
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.tooling.preview.Preview
import com.schoolapp.core.designsystem.component.AppScaffold
import com.schoolapp.core.designsystem.component.AppTopBar
import com.schoolapp.core.designsystem.component.BackButton
import com.schoolapp.core.designsystem.component.ErrorState
import com.schoolapp.core.designsystem.component.LoadingState
import com.schoolapp.core.designsystem.component.ScreenColumn
import com.schoolapp.core.designsystem.theme.SchoolTheme
import com.schoolapp.core.ui.loadErrorMessage
import com.schoolapp.feature.profile.R
import com.schoolapp.feature.profile.twofactor.components.CodeSheet
import com.schoolapp.feature.profile.twofactor.components.RecoveryCodesCard
import com.schoolapp.feature.profile.twofactor.components.SetupPanel
import com.schoolapp.feature.profile.twofactor.components.StatusCard

/** Callbacks for [TwoFactorScreen]; the route binds them to the view model. */
class TwoFactorCallbacks(
    val onBack: () -> Unit = {},
    val onRetry: () -> Unit = {},
    val onStartSetup: () -> Unit = {},
    val onCancelSetup: () -> Unit = {},
    val onCodeChange: (String) -> Unit = {},
    val onEnable: () -> Unit = {},
    val onCodesSaved: () -> Unit = {},
    val onOpenDialog: (TwoFactorDialogKind) -> Unit = {},
    val onCloseDialog: () -> Unit = {},
    val onDialogPasswordChange: (String) -> Unit = {},
    val onDialogCodeChange: (String) -> Unit = {},
    val onDialogSubmit: () -> Unit = {},
    val onDialogConfirm: () -> Unit = {},
    val onDialogConfirmDismiss: () -> Unit = {},
    val onMessage: (String) -> Unit = {},
)

@Composable
fun TwoFactorScreen(
    state: TwoFactorUiState,
    callbacks: TwoFactorCallbacks,
    snackbarHostState: SnackbarHostState,
    modifier: Modifier = Modifier,
) {
    AppScaffold(
        modifier = modifier,
        snackbarHostState = snackbarHostState,
        topBar = {
            AppTopBar(title = stringResource(R.string.two_factor_title), navigationIcon = { BackButton(callbacks.onBack) })
        },
    ) { padding ->
        val body = Modifier.padding(padding)
        when {
            state.isLoading -> LoadingState(body)
            state.loadError != null -> ErrorState(loadErrorMessage(state.loadError), body, onRetry = callbacks.onRetry)
            else -> ScreenColumn(body) {
                val codes = state.recoveryCodes
                if (codes != null) {
                    item(key = "codes") { RecoveryCodesCard(codes, state.account, callbacks.onCodesSaved, callbacks.onMessage) }
                } else {
                    item(key = "status") {
                        StatusCard(
                            state = state,
                            onStartSetup = callbacks.onStartSetup,
                            onRegenerate = { callbacks.onOpenDialog(TwoFactorDialogKind.REGENERATE) },
                            onDisable = { callbacks.onOpenDialog(TwoFactorDialogKind.DISABLE) },
                        )
                    }
                    if (state.setup != null && !state.enabled) {
                        item(key = "setup") {
                            SetupPanel(state, callbacks.onCodeChange, callbacks.onEnable, callbacks.onCancelSetup, callbacks.onMessage)
                        }
                    }
                }
            }
        }
    }
    state.dialog?.let { dialog ->
        CodeSheet(
            state = dialog,
            onPasswordChange = callbacks.onDialogPasswordChange,
            onCodeChange = callbacks.onDialogCodeChange,
            onSubmit = callbacks.onDialogSubmit,
            onConfirm = callbacks.onDialogConfirm,
            onConfirmDismiss = callbacks.onDialogConfirmDismiss,
            onDismiss = callbacks.onCloseDialog,
        )
    }
}

@Preview(showBackground = true)
@Composable
private fun TwoFactorScreenPreview() = SchoolTheme {
    TwoFactorScreen(
        state = TwoFactorUiState(isLoading = false, required = true),
        callbacks = TwoFactorCallbacks(),
        snackbarHostState = remember { SnackbarHostState() },
    )
}
