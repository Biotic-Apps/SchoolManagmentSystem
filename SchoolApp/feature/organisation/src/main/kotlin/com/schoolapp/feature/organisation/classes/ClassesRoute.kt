package com.schoolapp.feature.organisation.classes

import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.ui.Modifier
import androidx.hilt.lifecycle.viewmodel.compose.hiltViewModel
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import com.schoolapp.core.navigation.ClassSetupDestination

/** [onOpenClass] opens Class setup for a class in the overview's branch and session. */
@Composable
fun ClassesRoute(
    modifier: Modifier = Modifier,
    onOpenClass: (ClassSetupDestination) -> Unit = {},
    viewModel: ClassesViewModel = hiltViewModel(),
) {
    val state by viewModel.uiState.collectAsStateWithLifecycle()
    val open = { classId: String -> state.selectedBranchId?.let { onOpenClass(ClassSetupDestination(classId, it, state.sessionId, state.schoolId)) } }
    LaunchedEffect(state.openClassId) {
        state.openClassId?.let {
            viewModel.onClassOpened()
            open(it)
        }
    }
    ClassesScreen(
        state = state,
        onTabSelected = viewModel::onTabSelected,
        onBranchSelected = viewModel::onBranchSelected,
        onRetry = viewModel::load,
        onRefresh = viewModel::refresh,
        modifier = modifier,
        actions = ClassesActions(
            onOpenClass = { open(it) },
            onAddClass = viewModel::openAddClass,
            onReorder = viewModel::startReorder,
            reorder = ReorderActions(viewModel::moveClass, viewModel::saveOrder, viewModel::cancelReorder),
            addClass = AddClassActions(viewModel::onClassNameChange, viewModel::submitAddClass, viewModel::dismissAddClass),
        ),
    )
}
