package com.schoolapp.feature.progress.parent

import androidx.compose.foundation.lazy.items
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.outlined.Assignment
import androidx.compose.material.icons.outlined.FamilyRestroom
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.res.stringResource
import androidx.hilt.lifecycle.viewmodel.compose.hiltViewModel
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import com.schoolapp.core.designsystem.component.EmptyState
import com.schoolapp.core.designsystem.component.ErrorState
import com.schoolapp.core.designsystem.component.LoadingState
import com.schoolapp.core.designsystem.component.RefreshBox
import com.schoolapp.core.designsystem.component.ScreenColumn
import com.schoolapp.core.designsystem.component.SectionHeader
import com.schoolapp.core.ui.appErrorMessage
import com.schoolapp.feature.progress.R
import com.schoolapp.feature.progress.parent.components.ChildHomeworkCard
import com.schoolapp.feature.progress.parent.components.HomeworkTallyRow

@Composable
internal fun ChildHomeworkRoute(modifier: Modifier = Modifier, viewModel: ChildHomeworkViewModel = hiltViewModel()) {
    val state by viewModel.uiState.collectAsStateWithLifecycle()
    ChildHomeworkScreen(state, onRefresh = viewModel::refresh, onRetry = viewModel::retry, modifier = modifier)
}

@Composable
internal fun ChildHomeworkScreen(
    state: ChildHomeworkUiState,
    onRefresh: () -> Unit,
    onRetry: () -> Unit,
    modifier: Modifier = Modifier,
) {
    val error = state.error
    RefreshBox(isRefreshing = state.isRefreshing, onRefresh = onRefresh, modifier = modifier) {
        when {
            state.childId == null && !state.isLoading ->
                EmptyState(stringResource(R.string.progress_no_child), icon = Icons.Outlined.FamilyRestroom)
            state.isLoading -> LoadingState()
            error != null -> ErrorState(appErrorMessage(error), onRetry = onRetry)
            else -> ScreenColumn {
                item(key = "header") {
                    SectionHeader(
                        title = stringResource(R.string.progress_child_homework_title),
                        subtitle = listOfNotNull(state.childName, stringResource(R.string.progress_child_homework_window, state.days))
                            .joinToString(" · "),
                    )
                }
                if (state.items.isEmpty()) {
                    item(key = "empty") {
                        EmptyState(stringResource(R.string.progress_child_homework_empty), icon = Icons.AutoMirrored.Outlined.Assignment)
                    }
                } else {
                    item(key = "tally") { HomeworkTallyRow(state.tally) }
                    items(state.items, key = { it.id }) { ChildHomeworkCard(it) }
                }
            }
        }
    }
}
