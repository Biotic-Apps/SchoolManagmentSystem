package com.schoolapp.feature.messages

import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.ui.Modifier
import androidx.hilt.lifecycle.viewmodel.compose.hiltViewModel
import androidx.lifecycle.Lifecycle
import androidx.lifecycle.compose.LifecycleEventEffect
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import com.schoolapp.core.model.RoleRef
import com.schoolapp.core.navigation.MessageThreadDestination
import com.schoolapp.core.navigation.NewThreadDestination
import com.schoolapp.feature.messages.threads.ThreadsActions
import com.schoolapp.feature.messages.threads.ThreadsScreen
import com.schoolapp.feature.messages.threads.ThreadsViewModel

/** Menu `messages` ("Messages, Notices & Requests" for parents): shortcuts (parent) and the conversation list. */
@Composable
fun MessagesMenuScreen(
    role: RoleRef,
    onOpen: (Any) -> Unit,
    modifier: Modifier = Modifier,
) {
    val viewModel: ThreadsViewModel = hiltViewModel()
    val state by viewModel.uiState.collectAsStateWithLifecycle()
    LifecycleEventEffect(Lifecycle.Event.ON_RESUME) { viewModel.onResume() }
    ThreadsScreen(
        state = state,
        actions = ThreadsActions(
            onRefresh = viewModel::refresh,
            onOpenThread = { onOpen(MessageThreadDestination(it)) },
            onOpen = onOpen,
            onNewMessage = { onOpen(NewThreadDestination) },
            onSearchChange = viewModel::onSearchChange,
            onUnreadOnlyChange = viewModel::onUnreadOnlyChange,
            onBranchScopeChange = viewModel::onBranchScopeChange,
            onLoadMore = viewModel::loadMore,
            onRetryMore = viewModel::retryMore,
        ),
        modifier = modifier,
    )
}
