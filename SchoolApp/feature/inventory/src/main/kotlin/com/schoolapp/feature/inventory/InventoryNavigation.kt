package com.schoolapp.feature.inventory

import androidx.navigation.NavGraphBuilder
import androidx.navigation.NavHostController
import androidx.navigation.compose.composable
import com.schoolapp.feature.inventory.detail.PurchaseDetailRoute
import kotlinx.serialization.Serializable

/** Purchase request detail (order, receive, bill); [schoolId] is used when a vendor is added inline. */
@Serializable
internal data class PurchaseRequestDestination(val requestId: String, val schoolId: String? = null)

/** Detail screens opened from the inventory menu screen(s). */
fun NavGraphBuilder.inventoryDestinations(navController: NavHostController) {
    composable<PurchaseRequestDestination> { PurchaseDetailRoute(onBack = navController::popBackStack) }
}
