package com.schoolapp.feature.questionbank

import androidx.navigation.NavGraphBuilder
import androidx.navigation.NavHostController
import androidx.navigation.compose.composable
import com.schoolapp.feature.questionbank.form.QuestionFormRoute
import com.schoolapp.feature.questionbank.generate.GeneratePaperRoute
import com.schoolapp.feature.questionbank.paper.PaperDetailRoute

/** Detail screens opened from the questionbank menu screen(s). */
fun NavGraphBuilder.questionBankDestinations(navController: NavHostController) {
    composable<QuestionFormDestination> { QuestionFormRoute(onBack = navController::popBackStack) }
    composable<GeneratePaperDestination> {
        GeneratePaperRoute(
            onBack = navController::popBackStack,
            onGenerated = { paperId ->
                navController.navigate(PaperDetailDestination(paperId, justGenerated = true)) {
                    popUpTo<GeneratePaperDestination> { inclusive = true }
                }
            },
        )
    }
    composable<PaperDetailDestination> { PaperDetailRoute(onBack = navController::popBackStack) }
}
