package com.schoolapp.feature.profile

import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.tooling.preview.Preview
import com.schoolapp.core.designsystem.component.LoadingState
import com.schoolapp.core.designsystem.component.ScreenColumn
import com.schoolapp.core.designsystem.theme.SchoolTheme
import com.schoolapp.core.model.RoleKey
import com.schoolapp.feature.profile.components.NotificationsCard
import com.schoolapp.feature.profile.components.ProfileForm
import com.schoolapp.feature.profile.components.ProfileHeader
import com.schoolapp.feature.profile.components.RolesCard
import com.schoolapp.feature.profile.components.SecurityCard

@Composable
fun ProfileScreen(
    state: ProfileUiState,
    onNameChange: (String) -> Unit,
    onEmailChange: (String) -> Unit,
    onPhoneChange: (String) -> Unit,
    onSave: () -> Unit,
    onChangePassword: () -> Unit,
    onDeviceSessions: () -> Unit,
    modifier: Modifier = Modifier,
    onNotificationPreferences: () -> Unit = {},
    appLock: @Composable () -> Unit = {},
) {
    if (state.isLoading) {
        LoadingState(modifier)
        return
    }
    ScreenColumn(modifier) {
        item(key = "header") { ProfileHeader(name = state.original.name, email = state.original.email) }
        item(key = "form") { ProfileForm(state, onNameChange, onEmailChange, onPhoneChange, onSave) }
        if (state.roles.isNotEmpty()) item(key = "roles") { RolesCard(state.roles) }
        item(key = "notifications") { NotificationsCard(onNotificationPreferences) }
        item(key = "security") {
            SecurityCard(
                twoFactorEnabled = state.twoFactorEnabled,
                onChangePassword = onChangePassword,
                onDeviceSessions = onDeviceSessions,
            )
        }
        item(key = "app_lock") { appLock() }
    }
}

@Preview(showBackground = true)
@Composable
private fun ProfileScreenPreview() = SchoolTheme {
    val fields = ProfileFields("Sara Ali", "sara@school.pk", "03001234567")
    ProfileScreen(
        state = ProfileUiState(
            isLoading = false,
            form = fields,
            original = fields,
            roles = listOf(RoleSummary(RoleKey.PRINCIPAL, "Principal", "Main Branch")),
        ),
        onNameChange = {}, onEmailChange = {}, onPhoneChange = {}, onSave = {}, onChangePassword = {}, onDeviceSessions = {},
    )
}
