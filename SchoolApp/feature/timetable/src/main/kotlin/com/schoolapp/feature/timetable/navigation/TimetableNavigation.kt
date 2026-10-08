package com.schoolapp.feature.timetable.navigation

import androidx.compose.foundation.layout.padding
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.res.stringResource
import androidx.hilt.lifecycle.viewmodel.compose.hiltViewModel
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import androidx.navigation.NavGraphBuilder
import androidx.navigation.NavHostController
import androidx.navigation.compose.composable
import androidx.navigation.toRoute
import com.schoolapp.core.designsystem.component.AppScaffold
import com.schoolapp.core.designsystem.component.AppTopBar
import com.schoolapp.core.designsystem.component.BackButton
import com.schoolapp.core.navigation.BellScheduleDestination
import com.schoolapp.core.navigation.TimetableBuilderDestination
import com.schoolapp.feature.timetable.R
import com.schoolapp.feature.timetable.bell.BellScheduleScreen
import com.schoolapp.feature.timetable.bell.BellScheduleViewModel
import com.schoolapp.feature.timetable.builder.BuilderPane
import com.schoolapp.feature.timetable.builder.TimetableBuilderViewModel

/** Full-screen bell schedule (setup checklist link) and a single-section builder (teachers' own section). */
fun NavGraphBuilder.timetableDestinations(navController: NavHostController) {
    composable<BellScheduleDestination> { BellScheduleFullScreen(onBack = navController::popBackStack) }
    composable<TimetableBuilderDestination> { entry ->
        BuilderFullScreen(title = entry.toRoute<TimetableBuilderDestination>().title, onBack = navController::popBackStack)
    }
}

@Composable
private fun BellScheduleFullScreen(onBack: () -> Unit, viewModel: BellScheduleViewModel = hiltViewModel()) {
    val state by viewModel.uiState.collectAsStateWithLifecycle()
    AppScaffold(topBar = { AppTopBar(title = stringResource(R.string.tt_tab_bell), navigationIcon = { BackButton(onBack) }) }) { padding ->
        BellScheduleScreen(state, viewModel, Modifier.padding(padding))
    }
}

@Composable
private fun BuilderFullScreen(title: String?, onBack: () -> Unit, viewModel: TimetableBuilderViewModel = hiltViewModel()) {
    val state by viewModel.uiState.collectAsStateWithLifecycle()
    AppScaffold(
        topBar = {
            AppTopBar(
                title = title ?: stringResource(R.string.tt_tab_builder),
                subtitle = stringResource(R.string.tt_builder_subtitle),
                navigationIcon = { BackButton(onBack) },
            )
        },
    ) { padding ->
        BuilderPane(state, viewModel, showPicker = false, modifier = Modifier.padding(padding))
    }
}
