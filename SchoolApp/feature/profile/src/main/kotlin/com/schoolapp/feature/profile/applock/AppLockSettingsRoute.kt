package com.schoolapp.feature.profile.applock

import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.res.stringResource
import androidx.hilt.lifecycle.viewmodel.compose.hiltViewModel
import androidx.lifecycle.compose.LifecycleResumeEffect
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import com.schoolapp.core.data.applock.AppLockAuthenticators
import com.schoolapp.core.ui.unlock.rememberDeviceUnlockPrompt
import com.schoolapp.feature.profile.R

@Composable
internal fun AppLockSettingsRoute(
    modifier: Modifier = Modifier,
    viewModel: AppLockSettingsViewModel = hiltViewModel(),
) {
    val state by viewModel.uiState.collectAsStateWithLifecycle()
    LifecycleResumeEffect(viewModel) {
        viewModel.refreshAvailability()
        onPauseOrDispose { }
    }
    val confirm = rememberDeviceUnlockPrompt(
        title = stringResource(R.string.profile_app_lock_prompt_title),
        subtitle = stringResource(R.string.profile_app_lock_prompt_subtitle),
        authenticators = AppLockAuthenticators.allowed,
        onResult = viewModel::onEnableResult,
    )
    AppLockCard(state = state, onEnable = confirm, onDisable = viewModel::onDisable, modifier = modifier)
}
