package com.schoolapp.feature.exams

import androidx.navigation.NavGraphBuilder
import androidx.navigation.NavHostController
import androidx.navigation.compose.composable
import com.schoolapp.feature.exams.detail.ExamDetailRoute
import com.schoolapp.feature.exams.entry.MarksEntryRoute
import com.schoolapp.feature.exams.review.SheetReviewRoute
import com.schoolapp.feature.exams.skills.SkillsEntryRoute
import kotlinx.serialization.Serializable

/** Marks entry for one mark sheet (teacher, or a supervisor acting as proxy). */
@Serializable
internal data class MarkSheetDestination(val sheetId: String, val title: String)

/** Read-only sheet with Accept / Return for reviewers. */
@Serializable
internal data class SheetReviewDestination(val sheetId: String, val title: String)

/** Behaviour & skills ratings of one section for one exam. */
@Serializable
internal data class SkillsEntryDestination(val examId: String, val sectionId: String, val title: String)

/** One exam's workspace: overview & workflow, date sheet, mark sheets, behaviour & skills, print. */
@Serializable
internal data class ExamDetailDestination(val examId: String, val name: String)

fun NavGraphBuilder.examsDestinations(navController: NavHostController) {
    composable<ExamDetailDestination> {
        ExamDetailRoute(onBack = navController::popBackStack, onOpen = { navController.navigate(it) })
    }
    composable<MarkSheetDestination> { MarksEntryRoute(onBack = navController::popBackStack) }
    composable<SheetReviewDestination> { SheetReviewRoute(onBack = navController::popBackStack) }
    composable<SkillsEntryDestination> { SkillsEntryRoute(onBack = navController::popBackStack) }
}
