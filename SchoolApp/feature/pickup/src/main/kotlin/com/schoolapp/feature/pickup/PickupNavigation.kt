package com.schoolapp.feature.pickup

import androidx.navigation.NavGraphBuilder
import androidx.navigation.NavHostController
import androidx.navigation.compose.composable
import com.schoolapp.core.navigation.PickupDestination
import com.schoolapp.feature.pickup.departure.RecordDepartureRoute
import com.schoolapp.feature.pickup.parent.ParentPickupRoute
import kotlinx.serialization.Serializable

/** Gate: record who collected [studentId]; [earlyLeaveId] / [leaveTime] (`HH:mm`) link it to an early leave. */
@Serializable
internal data class RecordDepartureDestination(
    val studentId: String,
    val studentName: String? = null,
    val earlyLeaveId: String? = null,
    val leaveTime: String? = null,
)

fun NavGraphBuilder.pickupDestinations(navController: NavHostController) {
    composable<PickupDestination> { ParentPickupRoute(onBack = navController::popBackStack) }
    composable<RecordDepartureDestination> { RecordDepartureRoute(onBack = navController::popBackStack) }
}
