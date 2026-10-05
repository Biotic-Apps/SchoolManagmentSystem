package com.schoolapp.feature.notifications

import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.widthIn
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.outlined.NotificationsNone
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.tooling.preview.Preview
import androidx.compose.ui.unit.dp
import com.schoolapp.core.designsystem.component.AppScaffold
import com.schoolapp.core.designsystem.component.AppTextButton
import com.schoolapp.core.designsystem.component.AppTopBar
import com.schoolapp.core.designsystem.component.BackButton
import com.schoolapp.core.designsystem.component.ContentMaxWidth
import com.schoolapp.core.designsystem.component.DataList
import com.schoolapp.core.designsystem.component.EmptyState
import com.schoolapp.core.designsystem.component.ErrorState
import com.schoolapp.core.designsystem.component.FilterChipRow
import com.schoolapp.core.designsystem.component.InlineMessage
import com.schoolapp.core.designsystem.component.LoadingState
import com.schoolapp.core.designsystem.component.RefreshBox
import com.schoolapp.core.designsystem.component.StatusTone
import com.schoolapp.core.designsystem.component.SwitcherOption
import com.schoolapp.core.designsystem.theme.SchoolTheme
import com.schoolapp.core.model.notification.AppNotification
import com.schoolapp.core.ui.appErrorMessage
import com.schoolapp.feature.notifications.components.NotificationRow

@Composable
fun NotificationsScreen(
    state: NotificationsUiState,
    onBack: () -> Unit,
    onRefresh: () -> Unit,
    onUnreadOnlyChange: (Boolean) -> Unit,
    onOpen: (String) -> Unit,
    onMarkAllRead: () -> Unit,
    modifier: Modifier = Modifier,
) {
    AppScaffold(
        modifier = modifier,
        topBar = {
            AppTopBar(
                title = stringResource(R.string.notifications_title),
                navigationIcon = { BackButton(onBack) },
                actions = {
                    AppTextButton(
                        text = stringResource(R.string.notifications_mark_all),
                        onClick = onMarkAllRead,
                        enabled = state.hasUnread,
                        loading = state.isMarkingAll,
                    )
                },
            )
        },
    ) { padding ->
        Column(
            Modifier.padding(padding).fillMaxSize(),
            horizontalAlignment = Alignment.CenterHorizontally,
        ) {
            val width = Modifier.widthIn(max = ContentMaxWidth).fillMaxWidth()
            FilterChipRow(
                options = listOf(
                    SwitcherOption(ALL, stringResource(R.string.notifications_filter_all)),
                    SwitcherOption(UNREAD, stringResource(R.string.notifications_filter_unread)),
                ),
                selectedId = if (state.unreadOnly) UNREAD else ALL,
                onSelect = { onUnreadOnlyChange(it == UNREAD) },
                modifier = width.padding(horizontal = 16.dp, vertical = 8.dp),
            )
            state.actionError?.let {
                InlineMessage(appErrorMessage(it), StatusTone.Error, width.padding(horizontal = 16.dp))
            }
            RefreshBox(state.isRefreshing, onRefresh, width.weight(1f)) {
                when {
                    state.isLoading -> LoadingState()
                    state.error != null -> ErrorState(appErrorMessage(state.error), onRetry = onRefresh)
                    else -> DataList(
                        items = state.items,
                        key = { it.id },
                        modifier = Modifier.padding(16.dp),
                        emptyContent = {
                            EmptyState(
                                title = stringResource(R.string.notifications_empty_title),
                                message = stringResource(R.string.notifications_empty_message),
                                icon = Icons.Outlined.NotificationsNone,
                            )
                        },
                    ) { item -> NotificationRow(item, onClick = { onOpen(item.id) }) }
                }
            }
        }
    }
}

private const val ALL = "all"
private const val UNREAD = "unread"

@Preview(showBackground = true)
@Composable
private fun NotificationsScreenPreview() = SchoolTheme {
    NotificationsScreen(
        state = NotificationsUiState(
            isLoading = false,
            items = listOf(
                AppNotification("1", "APPROVAL", "Leave request needs your decision", "Bilal Ahmed, 2 days", false, "2026-10-05T08:00:00Z"),
                AppNotification("2", "SYSTEM", "Welcome to eSchool", null, true, "2026-10-01T08:00:00Z"),
            ),
        ),
        onBack = {}, onRefresh = {}, onUnreadOnlyChange = {}, onOpen = {}, onMarkAllRead = {},
    )
}
