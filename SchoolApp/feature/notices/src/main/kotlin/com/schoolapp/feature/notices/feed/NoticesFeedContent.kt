package com.schoolapp.feature.notices.feed

import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.outlined.Campaign
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.unit.dp
import com.schoolapp.core.designsystem.component.EmptyState
import com.schoolapp.core.designsystem.component.ErrorState
import com.schoolapp.core.designsystem.component.InlineMessage
import com.schoolapp.core.designsystem.component.LoadingState
import com.schoolapp.core.designsystem.component.RefreshBox
import com.schoolapp.core.designsystem.component.ScreenColumn
import com.schoolapp.core.designsystem.component.StatusTone
import com.schoolapp.core.ui.appErrorMessage
import com.schoolapp.feature.notices.NoticeComposeResult
import com.schoolapp.feature.notices.R
import com.schoolapp.feature.notices.components.NoticeCard

/** Pull-to-refresh notice list shared by the menu screen and the full-screen destination. */
@Composable
internal fun NoticesFeedContent(
    state: NoticesFeedUiState,
    onRefresh: () -> Unit,
    onOpen: (String) -> Unit,
    modifier: Modifier = Modifier,
    bottomPadding: Boolean = false,
) {
    when {
        state.isLoading -> LoadingState(modifier)
        state.error != null && state.notices.isEmpty() -> ErrorState(appErrorMessage(state.error), modifier, onRetry = onRefresh)
        else -> RefreshBox(isRefreshing = state.isRefreshing, onRefresh = onRefresh, modifier = modifier) {
            ScreenColumn(contentPadding = PaddingValues(start = 16.dp, top = 16.dp, end = 16.dp, bottom = if (bottomPadding) 88.dp else 16.dp)) {
                state.message?.let { message -> item(key = "message") { ComposeResultMessage(message) } }
                state.error?.let { error -> item(key = "error") { InlineMessage(appErrorMessage(error), StatusTone.Error) } }
                if (state.notices.isEmpty()) {
                    item(key = "empty") {
                        EmptyState(
                            stringResource(R.string.notices_empty),
                            message = stringResource(R.string.notices_empty_message),
                            icon = Icons.Outlined.Campaign,
                        )
                    }
                }
                items(state.notices.size, key = { state.notices[it].id }) { index ->
                    val notice = state.notices[index]
                    NoticeCard(notice, onClick = { onOpen(notice.id) })
                }
            }
        }
    }
}

@Composable
private fun ComposeResultMessage(result: NoticeComposeResult) {
    when (result) {
        NoticeComposeResult.PUBLISHED -> InlineMessage(stringResource(R.string.notices_result_published), StatusTone.Success)
        NoticeComposeResult.SENT_FOR_APPROVAL -> InlineMessage(stringResource(R.string.notices_result_sent_for_approval), StatusTone.Warning)
    }
}
