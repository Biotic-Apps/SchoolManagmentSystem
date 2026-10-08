package com.schoolapp.feature.home.components

import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.width
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.outlined.Logout
import androidx.compose.material.icons.outlined.Menu
import androidx.compose.material.icons.outlined.Notifications
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.saveable.rememberSaveable
import androidx.compose.runtime.setValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.unit.dp
import com.schoolapp.core.designsystem.component.AppTopBar
import com.schoolapp.core.designsystem.component.BadgedIconButton
import com.schoolapp.core.designsystem.component.ChildSwitcher
import com.schoolapp.core.designsystem.component.ConfirmDialog
import com.schoolapp.core.designsystem.component.DefaultLabelMaxWidth
import com.schoolapp.core.designsystem.component.RoleSwitcher
import com.schoolapp.core.designsystem.component.SwitcherOption
import com.schoolapp.core.model.RoleRef
import com.schoolapp.core.ui.roleLabel
import com.schoolapp.feature.home.R
import com.schoolapp.feature.home.RoleShellUiState

/** In [compact] mode both pills are icon-only and the active child's name becomes the subtitle. */
@Composable
internal fun ShellTopBar(
    title: String,
    state: RoleShellUiState.Ready,
    onRoleSelected: (RoleRef) -> Unit,
    onChildSelected: (String) -> Unit,
    onOpenNotifications: () -> Unit,
    onLogout: () -> Unit,
    modifier: Modifier = Modifier,
    compact: Boolean = false,
    /** Phones: opens the navigation drawer from a menu icon in place of the brand mark. */
    onOpenDrawer: (() -> Unit)? = null,
) {
    var confirmLogout by rememberSaveable { mutableStateOf(false) }
    val activeChildName = state.children.firstOrNull { it.id == state.activeChildId }?.fullName
    val roleOptions = state.roles.map { SwitcherOption(it.key, roleLabel(it, state.roleNames[it.key])) }
    AppTopBar(
        title = title,
        subtitle = if (compact && state.showChildSwitcher) activeChildName ?: state.userName else state.userName,
        modifier = modifier,
        navigationIcon = {
            if (onOpenDrawer != null) {
                IconButton(onClick = onOpenDrawer) {
                    Icon(Icons.Outlined.Menu, contentDescription = stringResource(R.string.home_open_menu))
                }
            } else {
                ShellBrandMark(state.brand)
            }
        },
        actions = {
            if (state.showChildSwitcher) {
                ChildSwitcher(
                    children = state.children.map { child ->
                        SwitcherOption(child.id, child.fullName, listOfNotNull(child.className, child.sectionName).joinToString(" - "))
                    },
                    selectedId = state.activeChildId,
                    onSelect = onChildSelected,
                    labelMaxWidth = if (compact) 0.dp else DefaultLabelMaxWidth,
                )
                Spacer(Modifier.width(8.dp))
            }
            if (state.showRoleSwitcher) {
                RoleSwitcher(
                    roles = roleOptions,
                    selectedId = state.activeRole.key,
                    onSelect = { key -> state.roles.firstOrNull { it.key == key }?.let(onRoleSelected) },
                    labelMaxWidth = if (compact) 0.dp else DefaultLabelMaxWidth,
                )
            }
            BadgedIconButton(
                icon = Icons.Outlined.Notifications,
                count = state.unreadCount,
                contentDescription = stringResource(R.string.home_notifications, state.unreadCount),
                onClick = onOpenNotifications,
            )
            // Phones sign out from the drawer.
            if (onOpenDrawer == null) {
                IconButton(onClick = { confirmLogout = true }) {
                    Icon(Icons.AutoMirrored.Outlined.Logout, contentDescription = stringResource(R.string.home_logout))
                }
            }
        },
    )
    if (confirmLogout) {
        ConfirmDialog(
            title = stringResource(R.string.home_logout_title),
            message = stringResource(R.string.home_logout_message),
            confirmLabel = stringResource(R.string.home_logout),
            onConfirm = {
                confirmLogout = false
                onLogout()
            },
            onDismiss = { confirmLogout = false },
            destructive = true,
        )
    }
}
