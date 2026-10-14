package com.schoolapp.feature.messages.threads

import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.padding
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.outlined.Chat
import androidx.compose.material.icons.outlined.Edit
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.unit.dp
import com.schoolapp.core.designsystem.component.AppFloatingButton
import com.schoolapp.core.designsystem.component.EmptyState
import com.schoolapp.core.designsystem.component.ErrorState
import com.schoolapp.core.designsystem.component.InlineMessage
import com.schoolapp.core.designsystem.component.LoadingState
import com.schoolapp.core.designsystem.component.PrimaryButton
import com.schoolapp.core.designsystem.component.RefreshBox
import com.schoolapp.core.designsystem.component.ScreenColumn
import com.schoolapp.core.designsystem.component.SectionHeader
import com.schoolapp.core.designsystem.component.StatusTone
import com.schoolapp.core.ui.appErrorMessage
import com.schoolapp.core.ui.loadErrorMessage
import com.schoolapp.feature.messages.R
import com.schoolapp.feature.messages.components.LoadMoreRow
import com.schoolapp.feature.messages.components.ParentShortcuts
import com.schoolapp.feature.messages.components.ThreadRow
import com.schoolapp.feature.messages.threads.components.InboxFilters

internal class ThreadsActions(
    val onRefresh: () -> Unit,
    val onOpenThread: (String) -> Unit,
    val onOpen: (Any) -> Unit,
    val onNewMessage: () -> Unit,
    val onSearchChange: (String) -> Unit,
    val onUnreadOnlyChange: (Boolean) -> Unit,
    val onBranchScopeChange: (Boolean) -> Unit,
    val onLoadMore: () -> Unit,
    val onRetryMore: () -> Unit,
)

@Composable
internal fun ThreadsScreen(state: ThreadsUiState, actions: ThreadsActions, modifier: Modifier = Modifier) {
    val canCompose = !state.branchScope
    Box(modifier.fillMaxSize()) {
        RefreshBox(state.isRefreshing, actions.onRefresh, Modifier.fillMaxSize()) {
            ScreenColumn(contentPadding = PaddingValues(start = 16.dp, top = 16.dp, end = 16.dp, bottom = 88.dp)) {
                if (state.isParent) {
                    item(key = "shortcuts") { ParentShortcuts(actions.onOpen) }
                }
                item(key = "header") { SectionHeader(stringResource(R.string.messages_threads_header)) }
                item(key = "filters") {
                    InboxFilters(state, actions.onSearchChange, actions.onUnreadOnlyChange, actions.onBranchScopeChange)
                }
                threadItems(state, actions, canCompose)
            }
        }
        if (canCompose) {
            AppFloatingButton(
                text = stringResource(R.string.messages_new_message),
                icon = Icons.Outlined.Edit,
                onClick = actions.onNewMessage,
                modifier = Modifier.align(Alignment.BottomEnd).padding(16.dp),
            )
        }
    }
}

private fun androidx.compose.foundation.lazy.LazyListScope.threadItems(
    state: ThreadsUiState,
    actions: ThreadsActions,
    canCompose: Boolean,
) {
    val threads = state.visibleThreads
    when {
        state.isLoading -> item(key = "loading") { LoadingState(rows = 4) }
        state.error != null && state.threads.isEmpty() -> item(key = "error") {
            ErrorState(loadErrorMessage(state.error), onRetry = actions.onRefresh)
        }
        threads.isEmpty() && !state.hasMore -> item(key = "empty") { ThreadsEmpty(state, actions, canCompose) }
        else -> {
            state.error?.let { error -> item(key = "stale") { InlineMessage(appErrorMessage(error), StatusTone.Error) } }
            items(threads.size, key = { threads[it].id }) { index ->
                val thread = threads[index]
                ThreadRow(
                    thread, state.myUserId, state.today,
                    onClick = { actions.onOpenThread(thread.id) },
                    modifier = Modifier.padding(bottom = if (index < threads.size - 1) 8.dp else 0.dp),
                )
            }
            if (state.hasMore) {
                item(key = "more") { LoadMoreRow(state.page, state.loadMoreError, actions.onLoadMore, actions.onRetryMore) }
            }
        }
    }
}

@Composable
private fun ThreadsEmpty(state: ThreadsUiState, actions: ThreadsActions, canCompose: Boolean) {
    val filtered = state.isFiltered
    EmptyState(
        title = stringResource(if (filtered) R.string.messages_empty_filtered_title else R.string.messages_empty_title),
        message = stringResource(
            when {
                filtered -> R.string.messages_empty_filtered_message
                state.branchScope -> R.string.messages_empty_branch_message
                else -> R.string.messages_empty_message
            },
        ),
        icon = Icons.AutoMirrored.Outlined.Chat,
        action = if (canCompose && !filtered) {
            {
                PrimaryButton(
                    text = stringResource(R.string.messages_new_message),
                    onClick = actions.onNewMessage,
                    leadingIcon = Icons.Outlined.Edit,
                )
            }
        } else {
            null
        },
    )
}
