package com.schoolapp.feature.progress

import androidx.navigation.NavGraphBuilder
import androidx.navigation.NavHostController
import androidx.navigation.compose.composable
import com.schoolapp.feature.progress.notes.StudentNotesRoute
import kotlinx.serialization.Serializable

/** One student's progress notes (staff). */
@Serializable
internal data class StudentNotesDestination(val studentId: String, val studentName: String, val rollNo: Int? = null)

fun NavGraphBuilder.progressDestinations(navController: NavHostController) {
    composable<StudentNotesDestination> { StudentNotesRoute(onBack = navController::popBackStack) }
}
