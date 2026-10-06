package com.schoolapp.feature.diary

import androidx.navigation.NavGraphBuilder
import androidx.navigation.NavHostController
import androidx.navigation.compose.composable
import com.schoolapp.core.navigation.DiaryEditorDestination
import com.schoolapp.feature.diary.editor.DiaryEditorRoute

fun NavGraphBuilder.diaryDestinations(navController: NavHostController) {
    composable<DiaryEditorDestination> { DiaryEditorRoute(onBack = navController::popBackStack) }
}
