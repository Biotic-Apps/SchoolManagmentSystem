package com.schoolapp.feature.students.navigation

import androidx.navigation.NavGraphBuilder
import androidx.navigation.NavHostController
import androidx.navigation.compose.composable
import com.schoolapp.feature.students.add.AddStudentRoute
import com.schoolapp.feature.students.contact.ContactChangeRoute
import com.schoolapp.feature.students.detail.StudentDetailRoute
import com.schoolapp.feature.students.link.LinkChildRoute
import com.schoolapp.feature.students.roster.SectionRosterRoute
import kotlinx.serialization.Serializable

@Serializable
data class SectionRosterDestination(val sectionId: String, val title: String)

@Serializable
data class StudentDetailDestination(val id: String)

@Serializable
data object ContactChangeDestination

@Serializable
data object LinkChildDestination

/** Register a student (`students.add`). */
@Serializable
data object AddStudentDestination

fun NavGraphBuilder.studentsDestinations(navController: NavHostController) {
    composable<SectionRosterDestination> {
        SectionRosterRoute(
            onBack = navController::popBackStack,
            onOpenStudent = { navController.navigate(StudentDetailDestination(it)) },
        )
    }
    composable<StudentDetailDestination> { StudentDetailRoute(onBack = navController::popBackStack) }
    composable<ContactChangeDestination> { ContactChangeRoute(onBack = navController::popBackStack) }
    composable<LinkChildDestination> { LinkChildRoute(onBack = navController::popBackStack) }
    composable<AddStudentDestination> {
        AddStudentRoute(
            onBack = navController::popBackStack,
            onCreated = { id ->
                navController.navigate(StudentDetailDestination(id)) { popUpTo<AddStudentDestination> { inclusive = true } }
            },
        )
    }
    composable<GuardianDetailDestination> {
        com.schoolapp.feature.students.guardiandetail.GuardianDetailRoute(
            onBack = navController::popBackStack,
            onOpenStudent = { navController.navigate(StudentDetailDestination(it)) },
        )
    }
}

/** A guardian's page: details, parent sign-in, linked children. */
@Serializable
data class GuardianDetailDestination(val id: String)
