package com.schoolapp.feature.diary.parent

import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.outlined.MenuBook
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
import com.schoolapp.core.ui.formatDate
import com.schoolapp.core.ui.rememberExternalActions
import com.schoolapp.feature.diary.R
import com.schoolapp.feature.diary.components.DiaryEntryCard

@Composable
internal fun ParentDiaryRoute(modifier: Modifier = Modifier, viewModel: ParentDiaryViewModel = hiltViewModel()) {
    val state by viewModel.uiState.collectAsStateWithLifecycle()
    val external = rememberExternalActions()
    ParentDiaryContent(state, onRefresh = viewModel::refresh, onOpenAttachment = external::open, modifier = modifier)
}

@Composable
internal fun ParentDiaryContent(
    state: ParentDiaryUiState,
    onRefresh: () -> Unit,
    onOpenAttachment: (String) -> Unit,
    modifier: Modifier = Modifier,
) {
    when {
        state.isLoading -> LoadingState(modifier)
        state.error != null -> ErrorState(appErrorMessage(state.error), modifier, onRetry = onRefresh)
        state.childId == null -> EmptyState(stringResource(R.string.diary_no_child), modifier, icon = Icons.AutoMirrored.Outlined.MenuBook)
        else -> RefreshBox(isRefreshing = state.isRefreshing, onRefresh = onRefresh, modifier = modifier) {
            ScreenColumn {
                when {
                    state.noSection -> item(key = "no_section") {
                        EmptyState(stringResource(R.string.diary_child_no_section), icon = Icons.AutoMirrored.Outlined.MenuBook)
                    }
                    state.days.isEmpty() -> item(key = "empty") {
                        EmptyState(
                            stringResource(R.string.diary_parent_empty),
                            message = stringResource(R.string.diary_parent_empty_message),
                            icon = Icons.AutoMirrored.Outlined.MenuBook,
                        )
                    }
                    else -> state.days.forEach { day ->
                        item(key = "day_${day.date}") { SectionHeader(title = formatDate(day.date).orEmpty()) }
                        items(day.entries.size, key = { day.entries[it].id }) { index ->
                            DiaryEntryCard(day.entries[index], onOpenAttachment = onOpenAttachment, showStatus = false)
                        }
                    }
                }
            }
        }
    }
}
