package com.schoolapp.feature.fees.staff.structure

import androidx.navigation.NavGraphBuilder
import androidx.navigation.NavHostController
import androidx.navigation.compose.composable
import com.schoolapp.feature.fees.staff.structure.form.FeePlanFormRoute
import kotlinx.serialization.Serializable

/** New ([planId] null) or edited fee plan of [sessionId] in [branchId]. */
@Serializable
internal data class FeePlanFormDestination(val branchId: String, val schoolId: String?, val sessionId: String, val planId: String?)

fun NavGraphBuilder.feesStructureDestinations(navController: NavHostController) {
    composable<FeePlanFormDestination> { FeePlanFormRoute(onDone = navController::popBackStack) }
}
