package com.schoolapp.feature.exams

import androidx.navigation.NavGraphBuilder
import androidx.navigation.NavHostController
import androidx.navigation.compose.composable
import com.schoolapp.feature.exams.entry.MarksEntryRoute
import com.schoolapp.feature.exams.review.SheetReviewRoute
import kotlinx.serialization.Serializable

/** Marks entry for one mark sheet (teacher, or a supervisor acting as proxy). */
@Serializable
internal data class MarkSheetDestination(val sheetId: String, val title: String)

/** Read-only sheet with Accept / Return for reviewers. */
@Serializable
internal data class SheetReviewDestination(val sheetId: String, val title: String)

fun NavGraphBuilder.examsDestinations(navController: NavHostController) {
    composable<MarkSheetDestination> { MarksEntryRoute(onBack = navController::popBackStack) }
    composable<SheetReviewDestination> { SheetReviewRoute(onBack = navController::popBackStack) }
}
