package com.schoolapp.feature.activities.list

import androidx.compose.foundation.layout.padding
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.res.stringResource
import androidx.hilt.lifecycle.viewmodel.compose.hiltViewModel
import androidx.lifecycle.Lifecycle
import androidx.lifecycle.compose.LifecycleEventEffect
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import com.schoolapp.core.designsystem.component.AppScaffold
import com.schoolapp.core.designsystem.component.AppTopBar
import com.schoolapp.core.designsystem.component.BackButton
import com.schoolapp.core.designsystem.component.LoadingState
import com.schoolapp.feature.activities.R
import com.schoolapp.feature.activities.list.staff.StaffActivitiesContent
import com.schoolapp.feature.activities.list.staff.StaffActivitiesViewModel

/** Activities list; with [onBack] it renders full screen with its own top bar (the shared destination). */
@Composable
internal fun ActivitiesListRoute(
    onOpenActivity: (String) -> Unit,
    onPropose: () -> Unit,
    modifier: Modifier = Modifier,
    onBack: (() -> Unit)? = null,
    viewModel: ActivitiesListViewModel = hiltViewModel(),
) {
    val state by viewModel.uiState.collectAsStateWithLifecycle()
    LifecycleEventEffect(Lifecycle.Event.ON_RESUME) { viewModel.onResume() }
    val content: @Composable (Modifier) -> Unit = { contentModifier ->
        when {
            state.isStaff -> StaffList(onOpenActivity, onPropose, contentModifier)
            !state.isParent && state.isLoading -> LoadingState(contentModifier)
            else -> ActivitiesListScreen(
                state = state,
                onTabSelected = viewModel::onTabSelected,
                onOpenActivity = onOpenActivity,
                onPropose = onPropose,
                onRefresh = viewModel::refresh,
                onRetry = viewModel::retry,
                modifier = contentModifier,
            )
        }
    }
    if (onBack == null) {
        content(modifier)
    } else {
        AppScaffold(
            modifier = modifier,
            topBar = { AppTopBar(title = stringResource(R.string.activities_title), navigationIcon = { BackButton(onBack) }) },
        ) { padding -> content(Modifier.padding(padding)) }
    }
}

@Composable
private fun StaffList(onOpenActivity: (String) -> Unit, onPropose: () -> Unit, modifier: Modifier) {
    val staffViewModel: StaffActivitiesViewModel = hiltViewModel(key = "staff_activities")
    val staff by staffViewModel.uiState.collectAsStateWithLifecycle()
    LifecycleEventEffect(Lifecycle.Event.ON_RESUME) { staffViewModel.onResume() }
    StaffActivitiesContent(staff, staffViewModel, staffViewModel.today, onOpenActivity, onPropose, modifier)
}
