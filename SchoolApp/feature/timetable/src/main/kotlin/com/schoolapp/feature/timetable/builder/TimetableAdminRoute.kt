package com.schoolapp.feature.timetable.builder

import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableIntStateOf
import androidx.compose.runtime.saveable.rememberSaveable
import androidx.compose.runtime.setValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.res.stringResource
import androidx.hilt.lifecycle.viewmodel.compose.hiltViewModel
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import com.schoolapp.core.designsystem.component.AppTabs
import com.schoolapp.feature.timetable.R
import com.schoolapp.feature.timetable.bell.BellScheduleScreen
import com.schoolapp.feature.timetable.bell.BellScheduleViewModel

/**
 * Timetable menu for roles with `timetable.edit` that manage a branch (principal, coordinator, head teacher,
 * super admin): the section builder and the bell schedule. [extraTab] adds e.g. Substitutions.
 */
@Composable
fun TimetableAdminRoute(
    modifier: Modifier = Modifier,
    extraTab: Pair<String, @Composable (Modifier) -> Unit>? = null,
) {
    var tab by rememberSaveable { mutableIntStateOf(0) }
    val titles = listOfNotNull(stringResource(R.string.tt_tab_builder), stringResource(R.string.tt_tab_bell), extraTab?.first)
    Column(modifier.fillMaxSize()) {
        AppTabs(titles = titles, selectedIndex = tab, onSelect = { tab = it })
        when (tab) {
            0 -> {
                val viewModel: TimetableBuilderViewModel = hiltViewModel()
                val state by viewModel.uiState.collectAsStateWithLifecycle()
                BuilderPane(state, viewModel, showPicker = true, modifier = Modifier.weight(1f))
            }
            1 -> {
                val viewModel: BellScheduleViewModel = hiltViewModel()
                val state by viewModel.uiState.collectAsStateWithLifecycle()
                BellScheduleScreen(state, viewModel, Modifier.weight(1f))
            }
            else -> extraTab?.second?.invoke(Modifier.weight(1f))
        }
    }
}
