package com.schoolapp.feature.payroll

import androidx.navigation.NavGraphBuilder
import androidx.navigation.NavHostController
import androidx.navigation.compose.composable
import com.schoolapp.feature.payroll.run.PayrollRunRoute
import kotlinx.serialization.Serializable

/** Payroll run detail with staff lines (FLAG_SECURE). */
@Serializable
internal data class PayrollRunDestination(val runId: String)

fun NavGraphBuilder.payrollDestinations(navController: NavHostController) {
    composable<PayrollRunDestination> { PayrollRunRoute(onBack = navController::popBackStack) }
}
