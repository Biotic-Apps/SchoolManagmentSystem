package com.schoolapp.feature.profile

import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.ui.Modifier
import androidx.hilt.lifecycle.viewmodel.compose.hiltViewModel
import androidx.lifecycle.compose.collectAsStateWithLifecycle

@Composable
fun ProfileRoute(
    onChangePassword: () -> Unit,
    onDeviceSessions: () -> Unit,
    onNotificationPreferences: () -> Unit,
    modifier: Modifier = Modifier,
    viewModel: ProfileViewModel = hiltViewModel(),
) {
    val state by viewModel.uiState.collectAsStateWithLifecycle()
    ProfileScreen(
        state = state,
        onNameChange = viewModel::onNameChange,
        onEmailChange = viewModel::onEmailChange,
        onPhoneChange = viewModel::onPhoneChange,
        onSave = viewModel::onSave,
        onChangePassword = onChangePassword,
        onDeviceSessions = onDeviceSessions,
        onNotificationPreferences = onNotificationPreferences,
        modifier = modifier,
    )
}
