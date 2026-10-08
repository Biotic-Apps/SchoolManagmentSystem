package com.schoolapp.feature.timetable.substitutions

import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableIntStateOf
import androidx.compose.runtime.saveable.rememberSaveable
import androidx.compose.runtime.setValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.res.stringResource
import androidx.hilt.lifecycle.viewmodel.compose.hiltViewModel
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import com.schoolapp.core.designsystem.component.AppTabs
import com.schoolapp.core.designsystem.component.LoadingState
import com.schoolapp.feature.timetable.R

/** Substitutions for the active branch; loads the first time it is shown. */
@Composable
fun SubstitutionsRoute(modifier: Modifier = Modifier, viewModel: SubstitutionsViewModel = hiltViewModel()) {
    val state by viewModel.uiState.collectAsStateWithLifecycle()
    LaunchedEffect(state.available) { if (state.available) viewModel.onOpened() }
    if (state.available) SubstitutionsScreen(state, viewModel, modifier) else LoadingState(modifier)
}

/** "Substitutions" tab for [com.schoolapp.feature.timetable.builder.TimetableAdminRoute]'s `extraTab`. */
@Composable
fun substitutionsTab(): Pair<String, @Composable (Modifier) -> Unit> {
    val content: @Composable (Modifier) -> Unit = { SubstitutionsRoute(it) }
    return stringResource(R.string.timetable_tab_substitutions) to content
}

/**
 * Supervisors' read-only timetable gets a "Timetable | Substitutions" tab row; everyone else (or a supervisor
 * without `timetable.view`) just gets [timetable].
 */
@Composable
internal fun SupervisorTimetableTabs(
    modifier: Modifier = Modifier,
    viewModel: SubstitutionsViewModel = hiltViewModel(),
    timetable: @Composable (Modifier) -> Unit,
) {
    val state by viewModel.uiState.collectAsStateWithLifecycle()
    if (!state.available) {
        timetable(modifier)
        return
    }
    var tab by rememberSaveable { mutableIntStateOf(0) }
    Column(modifier.fillMaxSize()) {
        AppTabs(
            titles = listOf(stringResource(R.string.timetable_tab_week), stringResource(R.string.timetable_tab_substitutions)),
            selectedIndex = tab,
            onSelect = { tab = it },
        )
        if (tab == 0) {
            timetable(Modifier.weight(1f))
        } else {
            LaunchedEffect(Unit) { viewModel.onOpened() }
            SubstitutionsScreen(state, viewModel, Modifier.weight(1f))
        }
    }
}
