package com.schoolapp.feature.timetable.builder

import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.padding
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.outlined.Apartment
import androidx.compose.runtime.Composable
import androidx.compose.runtime.CompositionLocalProvider
import androidx.compose.runtime.getValue
import androidx.compose.runtime.key
import androidx.compose.runtime.mutableIntStateOf
import androidx.compose.runtime.saveable.rememberSaveable
import androidx.compose.runtime.setValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.unit.dp
import androidx.hilt.lifecycle.viewmodel.compose.hiltViewModel
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import com.schoolapp.core.designsystem.component.AppTabs
import com.schoolapp.core.designsystem.component.EmptyState
import com.schoolapp.core.designsystem.component.LoadingState
import com.schoolapp.core.designsystem.component.ScopePicker
import com.schoolapp.feature.timetable.R
import com.schoolapp.feature.timetable.bell.BellScheduleScreen
import com.schoolapp.feature.timetable.bell.BellScheduleViewModel
import com.schoolapp.feature.timetable.scope.LocalTimetableBranch
import com.schoolapp.feature.timetable.scope.TimetableScopeViewModel
import com.schoolapp.feature.timetable.teacherweek.TeacherWeekRoute
import com.schoolapp.feature.timetable.teacherweek.TeacherWeekViewModel

private typealias TabContent = @Composable (Modifier) -> Unit

/**
 * Timetable menu for roles that manage a branch (principal, coordinator, head teacher, super admin), same tabs as
 * the web: section builder, bell schedule, [extraTab] (Substitutions) and teacher week. Global roles get a branch bar.
 */
@Composable
fun TimetableAdminRoute(
    modifier: Modifier = Modifier,
    extraTab: Pair<String, TabContent>? = null,
    scopeViewModel: TimetableScopeViewModel = hiltViewModel(),
) {
    val scope by scopeViewModel.state.collectAsStateWithLifecycle()
    var tab by rememberSaveable { mutableIntStateOf(0) }
    val tabs = adminTabs(scope.branchId, extraTab)
    Column(modifier.fillMaxSize()) {
        if (scope.options.size > 1) {
            ScopePicker(scope.options, scope.branchId, scopeViewModel::select, Modifier.padding(horizontal = 16.dp, vertical = 4.dp))
        }
        when {
            !scope.ready -> LoadingState()
            scope.branchId == null -> EmptyState(
                stringResource(R.string.tt_no_branch_title),
                message = stringResource(R.string.tt_no_branch_message),
                icon = Icons.Outlined.Apartment,
            )
            else -> {
                val selected = tab.coerceIn(0, tabs.lastIndex)
                AppTabs(titles = tabs.map { it.first }, selectedIndex = selected, onSelect = { tab = it })
                key(scope.branchId) {
                    CompositionLocalProvider(LocalTimetableBranch provides scope.branchId) {
                        tabs[selected].second(Modifier.weight(1f))
                    }
                }
            }
        }
    }
}

@Composable
private fun adminTabs(branchId: String?, extraTab: Pair<String, TabContent>?): List<Pair<String, TabContent>> {
    val builder: TabContent = { m ->
        val viewModel: TimetableBuilderViewModel = hiltViewModel(key = "tt-builder-$branchId")
        val state by viewModel.uiState.collectAsStateWithLifecycle()
        BuilderPane(state, viewModel, showPicker = true, modifier = m)
    }
    val bell: TabContent = { m ->
        val viewModel: BellScheduleViewModel = hiltViewModel(key = "tt-bell-$branchId")
        val state by viewModel.uiState.collectAsStateWithLifecycle()
        BellScheduleScreen(state, viewModel, m)
    }
    val teacherWeek: TabContent = { m ->
        val viewModel: TeacherWeekViewModel = hiltViewModel(key = "tt-teacher-$branchId")
        TeacherWeekRoute(m, viewModel)
    }
    return listOfNotNull(
        stringResource(R.string.tt_tab_builder) to builder,
        stringResource(R.string.tt_tab_bell) to bell,
        extraTab,
        stringResource(R.string.tt_tab_teacher_week) to teacherWeek,
    )
}
