package com.schoolapp.feature.home

import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.consumeWindowInsets
import androidx.compose.foundation.layout.imePadding
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.padding
import androidx.activity.compose.BackHandler
import androidx.compose.material3.DrawerValue
import androidx.compose.material3.ModalNavigationDrawer
import androidx.compose.material3.SnackbarHostState
import androidx.compose.material3.rememberDrawerState
import androidx.compose.runtime.rememberCoroutineScope
import kotlinx.coroutines.launch
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
import com.schoolapp.core.navigation.NotificationsDestination
import com.schoolapp.core.navigation.PrimaryNavigation
import com.schoolapp.feature.home.components.LogoutConfirmDialog
import com.schoolapp.feature.home.components.ShellModalDrawerSheet
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
            if (id != currentId || !onMenuScreen) navController.navigateToMenu(id, state.menu.first().id)
        }
        val primary = remember(state.menu, state.activeRole) { PrimaryNavigation.split(state.menu, state.activeRole).primary }
        val compact = layout == ShellNavigationLayout.BottomBar
        val drawerState = rememberDrawerState(DrawerValue.Closed)
        val scope = rememberCoroutineScope()
        BackHandler(enabled = drawerState.isOpen) { scope.launch { drawerState.close() } }
        var confirmLogout by rememberSaveable { mutableStateOf(false) }
        val title = state.menu.firstOrNull { it.id == currentId }?.label ?: state.brand.name ?: stringResource(R.string.home_title)

        val shell: @Composable () -> Unit = { Row(modifier.fillMaxSize()) {
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
                            compact = compact,
                            onOpenDrawer = if (compact) { { scope.launch { drawerState.open() } } } else null,
                        )
                    }
                },
                bottomBar = {
                    if (onMenuScreen && compact && state.menu.isNotEmpty()) {
                        ShellBottomBar(items = primary, selectedId = currentId, onSelect = onNavigate)
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
        } }

        if (compact && state.menu.isNotEmpty()) {
            // Edge swipe only on menu screens so it never fights detail screens' own gestures.
            ModalNavigationDrawer(
                drawerState = drawerState,
                gesturesEnabled = onMenuScreen || drawerState.isOpen,
                drawerContent = {
                    ShellModalDrawerSheet(
                        state = state,
                        selectedId = currentId.takeIf { onMenuScreen },
                        onSelect = { id ->
                            scope.launch { drawerState.close() }
                            onNavigate(id)
                        },
                        onRoleSelected = onRoleSelected,
                        onLogout = {
                            scope.launch { drawerState.close() }
                            confirmLogout = true
                        },
                    )
                },
                content = shell,
            )
        } else {
            shell()
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
