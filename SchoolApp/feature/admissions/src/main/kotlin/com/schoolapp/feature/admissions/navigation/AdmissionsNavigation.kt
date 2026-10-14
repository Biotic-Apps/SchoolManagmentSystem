package com.schoolapp.feature.admissions.navigation

import androidx.navigation.NavGraphBuilder
import androidx.navigation.NavHostController
import androidx.navigation.compose.composable
import com.schoolapp.feature.admissions.confirm.ConfirmAdmissionRoute
import com.schoolapp.feature.admissions.create.NewApplicationRoute
import com.schoolapp.feature.admissions.detail.ApplicationDetailRoute
import com.schoolapp.feature.admissions.detail.DetailResult
import kotlinx.serialization.Serializable

@Serializable
data class ApplicationDetailDestination(val id: String)

/** New admission application (`admissions.add`). */
@Serializable
data object NewApplicationDestination

/** Edit an application before a decision (`admissions.edit`). */
@Serializable
data class EditApplicationDestination(val id: String)

/** Confirm an offered application: section, admission date, fee (`admissions.approve`). */
@Serializable
data class ConfirmAdmissionDestination(val id: String)

fun NavGraphBuilder.admissionsDestinations(navController: NavHostController) {
    composable<ApplicationDetailDestination> {
        ApplicationDetailRoute(
            onBack = navController::popBackStack,
            onEdit = { id -> navController.navigate(EditApplicationDestination(id)) },
            onConfirmAdmission = { id -> navController.navigate(ConfirmAdmissionDestination(id)) },
        )
    }
    composable<NewApplicationDestination> {
        NewApplicationRoute(
            onBack = navController::popBackStack,
            onCreated = { id ->
                navController.navigate(ApplicationDetailDestination(id)) { popUpTo<NewApplicationDestination> { inclusive = true } }
            },
        )
    }
    composable<EditApplicationDestination> {
        NewApplicationRoute(onBack = navController::popBackStack, onCreated = { navController.backWithResult(DetailResult.UPDATED) })
    }
    composable<ConfirmAdmissionDestination> {
        ConfirmAdmissionRoute(onBack = navController::popBackStack, onDone = { navController.backWithResult(DetailResult.ENROLLED) })
    }
}

/** Hands a result to the application detail below (read by its ViewModel on resume) and goes back. */
private fun NavHostController.backWithResult(result: String) {
    previousBackStackEntry?.savedStateHandle?.set(DetailResult.KEY, result)
    popBackStack()
}
