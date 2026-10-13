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
import com.schoolapp.feature.messages.components.ParentShortcuts
import com.schoolapp.feature.messages.components.ThreadRow

@Composable
internal fun ThreadsScreen(
    state: ThreadsUiState,
    onRefresh: () -> Unit,
    onOpenThread: (String) -> Unit,
    onOpen: (Any) -> Unit,
    onNewMessage: () -> Unit,
    modifier: Modifier = Modifier,
) {
    Box(modifier.fillMaxSize()) {
        RefreshBox(state.isRefreshing, onRefresh, Modifier.fillMaxSize()) {
            ScreenColumn(contentPadding = PaddingValues(start = 16.dp, top = 16.dp, end = 16.dp, bottom = 88.dp)) {
                if (state.isParent) {
                    item(key = "shortcuts") { ParentShortcuts(onOpen) }
                }
                item(key = "header") { SectionHeader(stringResource(R.string.messages_threads_header)) }
                when {
                    state.isLoading -> item(key = "loading") { LoadingState(rows = 4) }
                    state.error != null && state.threads.isEmpty() -> item(key = "error") {
                        ErrorState(loadErrorMessage(state.error), onRetry = onRefresh)
                    }
                    state.threads.isEmpty() -> item(key = "empty") {
                        EmptyState(
                            title = stringResource(R.string.messages_empty_title),
                            message = stringResource(R.string.messages_empty_message),
                            icon = Icons.AutoMirrored.Outlined.Chat,
                            action = {
                                PrimaryButton(
                                    text = stringResource(R.string.messages_new_message),
                                    onClick = onNewMessage,
                                    leadingIcon = Icons.Outlined.Edit,
                                )
                            },
                        )
                    }
                    else -> {
                        state.error?.let { error -> item(key = "stale") { InlineMessage(appErrorMessage(error), StatusTone.Error) } }
                        items(state.threads.size, key = { state.threads[it].id }) { index ->
                            val thread = state.threads[index]
                            ThreadRow(
                                thread, state.myUserId, state.today,
                                onClick = { onOpenThread(thread.id) },
                                modifier = Modifier.padding(bottom = if (index < state.threads.size - 1) 8.dp else 0.dp),
                            )
                        }
                    }
                }
            }
        }
        AppFloatingButton(
            text = stringResource(R.string.messages_new_message),
            icon = Icons.Outlined.Edit,
            onClick = onNewMessage,
            modifier = Modifier.align(Alignment.BottomEnd).padding(16.dp),
        )
    }
}
