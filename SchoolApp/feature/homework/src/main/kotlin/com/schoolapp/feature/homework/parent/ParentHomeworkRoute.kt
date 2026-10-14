package com.schoolapp.feature.homework.parent

import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.lazy.items
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.outlined.AssignmentTurnedIn
import androidx.compose.material.icons.outlined.FamilyRestroom
import androidx.compose.material3.SnackbarHost
import androidx.compose.material3.SnackbarHostState
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.remember
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.unit.dp
import androidx.hilt.lifecycle.viewmodel.compose.hiltViewModel
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import com.schoolapp.core.designsystem.component.EmptyState
import com.schoolapp.core.designsystem.component.ErrorState
import com.schoolapp.core.designsystem.component.LoadingState
import com.schoolapp.core.designsystem.component.RefreshBox
import com.schoolapp.core.designsystem.component.ScreenColumn
import com.schoolapp.core.ui.appErrorMessage
import com.schoolapp.feature.homework.R
import com.schoolapp.feature.homework.SubmitHomeworkDestination
import com.schoolapp.feature.homework.components.HomeworkCard
import com.schoolapp.feature.homework.components.changeMessage

@Composable
internal fun ParentHomeworkRoute(onOpen: (Any) -> Unit, modifier: Modifier = Modifier, viewModel: ParentHomeworkViewModel = hiltViewModel()) {
    val state by viewModel.uiState.collectAsStateWithLifecycle()
    val snackbar = remember { SnackbarHostState() }
    val message = state.change?.let { changeMessage(it) }
    LaunchedEffect(message) {
        if (message != null) {
            viewModel.onChangeShown()
            snackbar.showSnackbar(message)
        }
    }
    Box(modifier.fillMaxSize()) {
        ParentHomeworkContent(
            state = state,
            onRefresh = viewModel::refresh,
            onOpen = { homeworkId -> state.childId?.let { onOpen(SubmitHomeworkDestination(homeworkId, it)) } },
        )
        SnackbarHost(snackbar, Modifier.align(Alignment.BottomCenter).padding(16.dp))
    }
}

@Composable
private fun ParentHomeworkContent(state: ParentHomeworkUiState, onRefresh: () -> Unit, onOpen: (String) -> Unit) {
    val error = state.error
    when {
        state.isLoading -> LoadingState()
        state.childId == null -> EmptyState(
            stringResource(R.string.homework_no_child),
            message = stringResource(R.string.homework_no_child_message),
            icon = Icons.Outlined.FamilyRestroom,
        )
        error != null -> ErrorState(appErrorMessage(error), onRetry = onRefresh)
        else -> RefreshBox(isRefreshing = state.isRefreshing, onRefresh = onRefresh) {
            ScreenColumn {
                if (state.homework.isEmpty()) {
                    item(key = "empty") {
                        EmptyState(
                            stringResource(R.string.homework_empty_parent),
                            message = stringResource(R.string.homework_empty_parent_message),
                            icon = Icons.Outlined.AssignmentTurnedIn,
                        )
                    }
                }
                items(state.homework, key = { it.id }) { homework ->
                    HomeworkCard(homework, onSelect = { onOpen(homework.id) }, compact = true)
                }
            }
        }
    }
}
