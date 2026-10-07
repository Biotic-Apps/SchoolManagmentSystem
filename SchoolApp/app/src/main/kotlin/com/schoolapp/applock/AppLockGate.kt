package com.schoolapp.applock

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.semantics.clearAndSetSemantics
import androidx.hilt.lifecycle.viewmodel.compose.hiltViewModel
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import com.schoolapp.R
import com.schoolapp.core.data.applock.AppLockAuthenticators
import com.schoolapp.core.data.applock.AppLockState
import com.schoolapp.core.designsystem.theme.AppColors
import com.schoolapp.core.ui.unlock.rememberDeviceUnlockPrompt

/**
 * Covers [content] while the app is locked. The app stays composed underneath (navigation state is
 * kept) but is hidden from touch and accessibility. The system prompt opens once each time it locks.
 */
@Composable
fun AppLockGate(
    onSignOut: () -> Unit,
    viewModel: AppLockViewModel = hiltViewModel(),
    content: @Composable () -> Unit,
) {
    val state by viewModel.uiState.collectAsStateWithLifecycle()
    val covered = state.lock != AppLockState.UNLOCKED
    Box(Modifier.fillMaxSize()) {
        Box(if (covered) Modifier.clearAndSetSemantics { } else Modifier) { content() }
        when (state.lock) {
            AppLockState.UNKNOWN -> Box(Modifier.fillMaxSize().background(AppColors.Background))
            AppLockState.LOCKED -> {
                val prompt = rememberDeviceUnlockPrompt(
                    title = stringResource(R.string.app_lock_prompt_title),
                    subtitle = stringResource(R.string.app_lock_prompt_subtitle),
                    authenticators = AppLockAuthenticators.allowed,
                    onResult = viewModel::onUnlockResult,
                )
                LaunchedEffect(state.canUnlock) { if (state.canUnlock == true) prompt() }
                AppLockScreen(state = state, onUnlock = prompt, onSignOut = onSignOut)
            }
            AppLockState.UNLOCKED -> Unit
        }
    }
}
