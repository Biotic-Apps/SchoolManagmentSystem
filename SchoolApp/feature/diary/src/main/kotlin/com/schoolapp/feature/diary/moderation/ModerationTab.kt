package com.schoolapp.feature.diary.moderation

import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.padding
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.outlined.RateReview
import androidx.compose.material3.SnackbarHost
import androidx.compose.material3.SnackbarHostState
import androidx.compose.material3.Text
import androidx.compose.material3.MaterialTheme
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.setValue
import com.schoolapp.core.common.result.AppError
import androidx.compose.runtime.remember
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.unit.dp
import androidx.hilt.lifecycle.viewmodel.compose.hiltViewModel
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import com.schoolapp.core.designsystem.component.EmptyState
import com.schoolapp.core.designsystem.component.ErrorState
import com.schoolapp.core.designsystem.component.FilterChipRow
import com.schoolapp.core.designsystem.component.LoadingState
import com.schoolapp.core.designsystem.component.RefreshBox
import com.schoolapp.core.designsystem.component.ScreenColumn
import com.schoolapp.core.designsystem.component.SwitcherOption
import com.schoolapp.core.designsystem.theme.AppColors
import com.schoolapp.core.ui.actionErrorMessage
import com.schoolapp.core.ui.formatDate
import com.schoolapp.core.ui.loadErrorMessage
import com.schoolapp.core.ui.rememberExternalActions
import com.schoolapp.feature.diary.R
import com.schoolapp.feature.diary.components.DiaryEntryCard
import com.schoolapp.feature.diary.supervisor.ReturnEntrySheet

/** Moderation tab (web ModerationTab): every SUBMITTED entry of the branch with Publish / Return. */
@Composable
internal fun ModerationTab(modifier: Modifier = Modifier, viewModel: ModerationViewModel = hiltViewModel()) {
    val state by viewModel.uiState.collectAsStateWithLifecycle()
    val external = rememberExternalActions()
    val snackbar = remember { SnackbarHostState() }
    val context = LocalContext.current
    var failure by remember { mutableStateOf<AppError?>(null) }
    LaunchedEffect(viewModel) {
        viewModel.events.collect { event ->
            when (event) {
                ModerationEvent.Published -> snackbar.showSnackbar(context.getString(R.string.diary_result_published))
                ModerationEvent.Returned -> snackbar.showSnackbar(context.getString(R.string.diary_returned_done))
                is ModerationEvent.Failed -> failure = event.error
            }
        }
    }
    failure?.let { current ->
        val message = actionErrorMessage(current)
        LaunchedEffect(current) {
            failure = null
            snackbar.showSnackbar(message)
        }
    }
    val error = state.error
    Box(modifier.fillMaxSize()) {
        RefreshBox(isRefreshing = state.isRefreshing, onRefresh = { viewModel.load(refresh = true) }) {
            ScreenColumn(itemSpacing = 12.dp) {
                if (state.branches.isNotEmpty()) item(key = "branches") {
                    FilterChipRow(state.branches.map { SwitcherOption(it.id, it.name) }, state.branchId, viewModel::onBranchSelected)
                }
                when {
                    state.isLoading -> item(key = "loading") { LoadingState() }
                    error != null -> item(key = "error") { ErrorState(loadErrorMessage(error), onRetry = { viewModel.load() }) }
                    state.entries.isEmpty() -> item(key = "empty") {
                        EmptyState(
                            title = stringResource(R.string.diary_moderation_empty),
                            message = stringResource(R.string.diary_moderation_empty_message),
                            icon = Icons.Outlined.RateReview,
                        )
                    }
                    else -> items(state.entries.size, key = { state.entries[it].id }) { index ->
                        val entry = state.entries[index]
                        val where = listOfNotNull(entry.className, entry.sectionName, formatDate(entry.date), entry.authorName).joinToString(" · ")
                        DiaryEntryCard(
                            entry = entry,
                            onOpenAttachment = external::open,
                            footer = {
                                Text(where, style = MaterialTheme.typography.bodySmall, color = AppColors.TextSecondary)
                                ModerationActions(
                                    publishing = state.publishingId == entry.id,
                                    enabled = state.publishingId == null,
                                    onPublish = { viewModel.publish(entry.id) },
                                    onReturn = { viewModel.onReturnClick(entry.id) },
                                )
                            },
                        )
                    }
                }
            }
        }
        SnackbarHost(snackbar, Modifier.align(Alignment.BottomCenter).padding(16.dp))
    }
    state.returnEditor?.let { editor ->
        ReturnEntrySheet(editor, viewModel::onReturnCommentChange, viewModel::submitReturn, viewModel::onDismissReturn)
    }
}
