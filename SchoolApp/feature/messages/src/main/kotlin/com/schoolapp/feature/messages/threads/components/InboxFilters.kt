package com.schoolapp.feature.messages.threads.components

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.unit.dp
import com.schoolapp.core.designsystem.component.FilterChipRow
import com.schoolapp.core.designsystem.component.InlineMessage
import com.schoolapp.core.designsystem.component.SearchField
import com.schoolapp.core.designsystem.component.SegmentedChoice
import com.schoolapp.core.designsystem.component.StatusTone
import com.schoolapp.core.designsystem.component.SwitcherOption
import com.schoolapp.feature.messages.R
import com.schoolapp.feature.messages.threads.ThreadsUiState

/** Search, unread-only filter and (branch readers) the Mine / Branch scope switch. */
@Composable
internal fun InboxFilters(
    state: ThreadsUiState,
    onSearchChange: (String) -> Unit,
    onUnreadOnlyChange: (Boolean) -> Unit,
    onBranchScopeChange: (Boolean) -> Unit,
    modifier: Modifier = Modifier,
) {
    Column(modifier.fillMaxWidth(), verticalArrangement = Arrangement.spacedBy(8.dp)) {
        if (state.canReadBranch) {
            SegmentedChoice(
                labels = listOf(stringResource(R.string.messages_scope_mine), stringResource(R.string.messages_scope_branch)),
                selectedIndex = if (state.branchScope) 1 else 0,
                onSelect = { onBranchScopeChange(it == 1) },
            )
        }
        SearchField(
            value = state.search,
            onValueChange = onSearchChange,
            placeholder = stringResource(R.string.messages_search),
            modifier = Modifier.fillMaxWidth(),
        )
        if (state.branchScope) {
            InlineMessage(stringResource(R.string.messages_branch_note), StatusTone.Info)
        } else {
            FilterChipRow(
                options = listOf(
                    SwitcherOption(ALL, stringResource(R.string.messages_filter_all)),
                    SwitcherOption(UNREAD, stringResource(R.string.messages_filter_unread)),
                ),
                selectedId = if (state.unreadOnly) UNREAD else ALL,
                onSelect = { onUnreadOnlyChange(it == UNREAD) },
            )
        }
    }
}

private const val ALL = "all"
private const val UNREAD = "unread"
