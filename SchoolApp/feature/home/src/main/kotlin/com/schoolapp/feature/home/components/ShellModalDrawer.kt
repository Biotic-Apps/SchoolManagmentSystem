package com.schoolapp.feature.home.components

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxHeight
import androidx.compose.foundation.layout.navigationBarsPadding
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.statusBarsPadding
import androidx.compose.foundation.layout.widthIn
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.outlined.Logout
import androidx.compose.material3.HorizontalDivider
import androidx.compose.material3.Icon
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.ModalDrawerSheet
import androidx.compose.material3.NavigationDrawerItem
import androidx.compose.material3.NavigationDrawerItemDefaults
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import com.schoolapp.core.designsystem.component.PersonAvatar
import com.schoolapp.core.designsystem.component.RoleSwitcher
import com.schoolapp.core.designsystem.component.SwitcherOption
import com.schoolapp.core.designsystem.theme.AppColors
import com.schoolapp.core.model.RoleRef
import com.schoolapp.core.navigation.MenuGroup
import com.schoolapp.core.navigation.MenuGroups
import com.schoolapp.core.ui.roleLabel
import com.schoolapp.feature.home.R
import com.schoolapp.feature.home.RoleShellUiState

/**
 * Phone navigation drawer: who is signed in (role switcher when several roles), every destination of the
 * role grouped under small headings in one list, and Sign out pinned at the bottom.
 */
@Composable
internal fun ShellModalDrawerSheet(
    state: RoleShellUiState.Ready,
    selectedId: String?,
    onSelect: (String) -> Unit,
    onRoleSelected: (RoleRef) -> Unit,
    onLogout: () -> Unit,
) {
    val itemColors = NavigationDrawerItemDefaults.colors(
        selectedContainerColor = AppColors.Selected,
        selectedIconColor = AppColors.OnSelected,
        selectedTextColor = AppColors.OnSelected,
        unselectedContainerColor = AppColors.Surface,
        unselectedIconColor = AppColors.TextSecondary,
        unselectedTextColor = AppColors.TextPrimary,
    )
    ModalDrawerSheet(
        modifier = Modifier.widthIn(max = 320.dp).fillMaxHeight(),
        drawerContainerColor = AppColors.Surface,
        drawerTonalElevation = NoElevation,
    ) {
        Column(Modifier.fillMaxHeight().statusBarsPadding().navigationBarsPadding()) {
            DrawerHeader(state, onRoleSelected)
            HorizontalDivider(color = AppColors.Border)
            LazyColumn(Modifier.weight(1f), contentPadding = PaddingValues(horizontal = 12.dp, vertical = 8.dp)) {
                MenuGroups.group(state.menu).forEach { (group, items) ->
                    if (group != MenuGroup.HOME) {
                        item(key = "h-${group.name}") { GroupHeading(group) }
                    }
                    items(items, key = { it.id }) { item ->
                        NavigationDrawerItem(
                            label = { Text(item.label, maxLines = 1, overflow = TextOverflow.Ellipsis) },
                            icon = { NavIcon(item.icon) },
                            selected = item.id == selectedId,
                            onClick = { onSelect(item.id) },
                            shape = MaterialTheme.shapes.small,
                            colors = itemColors,
                        )
                    }
                }
            }
            HorizontalDivider(color = AppColors.Border)
            NavigationDrawerItem(
                label = { Text(stringResource(R.string.home_logout), color = MaterialTheme.colorScheme.error) },
                icon = { Icon(Icons.AutoMirrored.Outlined.Logout, contentDescription = null, tint = MaterialTheme.colorScheme.error) },
                selected = false,
                onClick = onLogout,
                shape = MaterialTheme.shapes.small,
                colors = itemColors,
                modifier = Modifier.padding(12.dp),
            )
        }
    }
}

@Composable
private fun DrawerHeader(state: RoleShellUiState.Ready, onRoleSelected: (RoleRef) -> Unit) {
    val role = roleLabel(state.activeRole, state.roleNames[state.activeRole.key])
    Row(Modifier.padding(20.dp), horizontalArrangement = Arrangement.spacedBy(14.dp), verticalAlignment = Alignment.CenterVertically) {
        PersonAvatar(name = state.userName, photoUrl = null, size = 48.dp)
        Column(Modifier.weight(1f), verticalArrangement = Arrangement.spacedBy(2.dp)) {
            Text(state.userName, style = MaterialTheme.typography.titleMedium, fontWeight = FontWeight.SemiBold, color = AppColors.TextPrimary, maxLines = 1, overflow = TextOverflow.Ellipsis)
            if (state.showRoleSwitcher) {
                RoleSwitcher(
                    roles = state.roles.map { SwitcherOption(it.key, roleLabel(it, state.roleNames[it.key])) },
                    selectedId = state.activeRole.key,
                    onSelect = { key -> state.roles.firstOrNull { it.key == key }?.let(onRoleSelected) },
                )
            } else {
                Text(role, style = MaterialTheme.typography.bodyMedium, color = AppColors.Primary)
            }
            state.branchName?.let { Text(it, style = MaterialTheme.typography.bodySmall, color = AppColors.TextSecondary, maxLines = 1, overflow = TextOverflow.Ellipsis) }
        }
    }
}

@Composable
private fun GroupHeading(group: MenuGroup) {
    val title = when (group) {
        MenuGroup.HOME, MenuGroup.TEACHING -> R.string.home_group_teaching
        MenuGroup.PEOPLE -> R.string.home_group_people
        MenuGroup.COMMUNICATION -> R.string.home_group_communication
        MenuGroup.FINANCE -> R.string.home_group_finance
        MenuGroup.SCHOOL -> R.string.home_group_school
        MenuGroup.MY_WORK -> R.string.home_group_my_work
        MenuGroup.ACCOUNT -> R.string.home_group_account
    }
    Text(
        text = stringResource(title),
        style = MaterialTheme.typography.labelMedium,
        color = AppColors.TextSecondary,
        modifier = Modifier.padding(start = 16.dp, top = 16.dp, bottom = 6.dp),
    )
}
