package com.schoolapp.feature.settings

import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.hilt.lifecycle.viewmodel.compose.hiltViewModel
import com.schoolapp.core.model.RoleRef
import com.schoolapp.feature.settings.shell.SettingsRoute

/** Menu `settings` (Settings & Backups): school branding, notifications, policies, support, backups, import, SMS gateway. */
@Composable
fun SettingsMenuScreen(role: RoleRef, onOpen: (Any) -> Unit, modifier: Modifier = Modifier) {
    SettingsRoute(modifier = modifier, viewModel = hiltViewModel(key = "settings_${role.key}"))
}
