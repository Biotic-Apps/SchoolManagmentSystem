package com.schoolapp.feature.home

import androidx.navigation.NavHostController
import com.schoolapp.core.navigation.MenuDestination

/**
 * Opens a menu screen keeping only the home menu below it, so Back from any tab returns
 * home and Back on home leaves the app. All menus share one route type, so entries are
 * matched by route object (with its menu id): `launchSingleTop` or a destination-id
 * `popUpTo` would replace or keep the wrong menu entry.
 */
internal fun NavHostController.navigateToMenu(id: String, homeMenuId: String) {
    val home = MenuDestination(homeMenuId)
    if (id == homeMenuId) {
        popBackStack(home, inclusive = false)
        return
    }
    navigate(MenuDestination(id)) { popUpTo(home) }
}
