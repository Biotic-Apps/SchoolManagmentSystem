package com.schoolapp.feature.homework

import androidx.navigation.NavGraphBuilder
import androidx.navigation.NavHostController
import androidx.navigation.compose.composable
import com.schoolapp.feature.homework.assign.AssignHomeworkRoute
import com.schoolapp.feature.homework.submissions.SubmissionsRoute
import com.schoolapp.feature.homework.submit.SubmitHomeworkRoute

/** Detail screens opened from the homework menu screen(s). */
fun NavGraphBuilder.homeworkDestinations(navController: NavHostController) {
    composable<AssignHomeworkDestination> { AssignHomeworkRoute(onBack = navController::popBackStack) }
    composable<HomeworkSubmissionsDestination> { SubmissionsRoute(onBack = navController::popBackStack) }
    composable<SubmitHomeworkDestination> { SubmitHomeworkRoute(onBack = navController::popBackStack) }
}
