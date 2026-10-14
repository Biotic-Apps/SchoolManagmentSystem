package com.schoolapp.feature.notices.feed

import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.outlined.Campaign
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.res.stringResource
import com.schoolapp.core.designsystem.component.EmptyState
import com.schoolapp.feature.notices.R
import com.schoolapp.feature.notices.components.ComposeResultMessage
import com.schoolapp.feature.notices.components.NoticeCard
import com.schoolapp.feature.notices.paging.NoticeList

/** Pull-to-refresh, paged notice feed shared by the menu screen and the full-screen destination. */
@Composable
internal fun NoticesFeedContent(
    state: NoticesFeedUiState,
    onRefresh: () -> Unit,
    onLoadMore: () -> Unit,
    onOpen: (String) -> Unit,
    modifier: Modifier = Modifier,
    bottomPadding: Boolean = false,
) {
    NoticeList(
        page = state.page,
        onRefresh = onRefresh,
        onLoadMore = onLoadMore,
        modifier = modifier,
        bottomPadding = bottomPadding,
        header = { state.message?.let { message -> item(key = "message") { ComposeResultMessage(message) } } },
        empty = {
            EmptyState(stringResource(R.string.notices_empty), message = stringResource(R.string.notices_empty_message), icon = Icons.Outlined.Campaign)
        },
        row = { notice -> NoticeCard(notice, onClick = { onOpen(notice.id) }) },
    )
}
