package com.schoolapp.feature.home

import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.consumeWindowInsets
import androidx.compose.foundation.layout.imePadding
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.padding
import androidx.compose.material3.SnackbarHostState
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.SideEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.key
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.saveable.rememberSaveable
import androidx.compose.runtime.setValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.res.stringResource
import androidx.navigation.NavDestination.Companion.hasRoute
import androidx.navigation.compose.currentBackStackEntryAsState
import androidx.navigation.compose.rememberNavController
import androidx.navigation.toRoute
import com.schoolapp.core.designsystem.component.AppScaffold
import com.schoolapp.core.designsystem.component.EmptyState
import com.schoolapp.core.model.RoleRef
import com.schoolapp.core.navigation.MenuDestination
import com.schoolapp.core.navigation.NavigationSplit
import com.schoolapp.core.navigation.NotificationsDestination
import com.schoolapp.core.navigation.PrimaryNavigation
import com.schoolapp.feature.home.components.LogoutConfirmDialog
import com.schoolapp.feature.home.components.MoreMenuSheet
import com.schoolapp.feature.home.components.ShellBottomBar
import com.schoolapp.feature.home.components.ShellDrawerSheet
import com.schoolapp.feature.home.components.ShellNavHost
import com.schoolapp.feature.home.components.ShellNavigationRail
import com.schoolapp.feature.home.components.ShellTopBar

@Composable
fun RoleShellScreen(
    state: RoleShellUiState.Ready,
    content: ShellContent,
    onRoleSelected: (RoleRef) -> Unit,
    onChildSelected: (String) -> Unit,
    onSwitchErrorShown: () -> Unit,
    onLogout: () -> Unit,
    modifier: Modifier = Modifier,
) {
    val layout = rememberShellNavigationLayout()
    val snackbar = remember { SnackbarHostState() }
    val switchError = stringResource(R.string.home_switch_failed)
    LaunchedEffect(state.switchFailed) {
        if (state.switchFailed) {
            snackbar.showSnackbar(switchError)
            onSwitchErrorShown()
        }
    }

    key(state.activeRole) {
        val navController = rememberNavController()
        val entry by navController.currentBackStackEntryAsState()
        val onMenuScreen = entry?.destination?.hasRoute(MenuDestination::class) ?: true
        val entryMenuId = entry?.takeIf { onMenuScreen }?.toRoute<MenuDestination>()?.menuId
        var lastMenuId by rememberSaveable { mutableStateOf<String?>(null) }
        SideEffect { if (entryMenuId != null) lastMenuId = entryMenuId }
        val currentId = entryMenuId ?: lastMenuId ?: state.menu.firstOrNull()?.id
        val onNavigate: (String) -> Unit = { id ->
            if (id != currentId || !onMenuScreen) {
                navController.navigate(MenuDestination(id)) {
                    popUpTo(navController.graph.startDestinationId)
                    launchSingleTop = true
                }
            }
        }
        val split = remember(state.menu, state.activeRole, layout) {
            if (layout == ShellNavigationLayout.BottomBar) PrimaryNavigation.split(state.menu, state.activeRole) else NavigationSplit(state.menu, emptyList())
        }
        val primary = split.primary
        val overflow = split.overflow
        var showMore by rememberSaveable { mutableStateOf(false) }
        var confirmLogout by rememberSaveable { mutableStateOf(false) }
        val title = state.menu.firstOrNull { it.id == currentId }?.label ?: state.brand.name ?: stringResource(R.string.home_title)

        Row(modifier.fillMaxSize()) {
            when (layout) {
                ShellNavigationLayout.Drawer -> ShellDrawerSheet(state.menu, currentId, onNavigate)
                ShellNavigationLayout.Rail -> ShellNavigationRail(state.menu, currentId, onNavigate)
                ShellNavigationLayout.BottomBar -> Unit
            }
            AppScaffold(
                modifier = Modifier.weight(1f),
                snackbarHostState = snackbar,
                topBar = {
                    if (onMenuScreen) {
                        ShellTopBar(
                            title = title,
                            state = state,
                            onRoleSelected = onRoleSelected,
                            onChildSelected = onChildSelected,
                            onOpenNotifications = {
                                navController.navigate(NotificationsDestination) { launchSingleTop = true }
                            },
                            onLogout = onLogout,
                            compact = layout == ShellNavigationLayout.BottomBar,
                        )
                    }
                },
                bottomBar = {
                    if (onMenuScreen && layout == ShellNavigationLayout.BottomBar && state.menu.isNotEmpty()) {
                        ShellBottomBar(
                            items = primary,
                            selectedId = currentId,
                            hasMore = overflow.isNotEmpty(),
                            moreSelected = overflow.any { it.id == currentId },
                            onSelect = onNavigate,
                            onMore = { showMore = true },
                        )
                    }
                },
            ) { padding ->
                if (state.menu.isEmpty()) {
                    EmptyState(
                        title = stringResource(R.string.home_no_menu_title),
                        message = stringResource(R.string.home_no_menu_message),
                        modifier = Modifier.padding(padding),
                    )
                } else {
                    ShellNavHost(
                        navController = navController,
                        startMenuId = state.menu.first().id,
                        menuIds = remember(state.menu) { state.menu.map { it.id }.toSet() },
                        activeRole = state.activeRole,
                        content = content,
                        modifier = Modifier.padding(padding).consumeWindowInsets(padding).imePadding(),
                    )
                }
            }
        }

        if (showMore) {
            MoreMenuSheet(
                items = overflow,
                selectedId = currentId,
                onSelect = {
                    showMore = false
                    onNavigate(it)
                },
                onDismiss = { showMore = false },
                onLogout = {
                    showMore = false
                    confirmLogout = true
                },
            )
        }
        if (confirmLogout) {
            LogoutConfirmDialog(
                onConfirm = {
                    confirmLogout = false
                    onLogout()
                },
                onDismiss = { confirmLogout = false },
            )
        }
    }
}
