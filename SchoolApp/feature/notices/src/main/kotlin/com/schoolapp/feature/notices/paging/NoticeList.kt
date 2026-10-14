package com.schoolapp.feature.notices.paging

import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.lazy.LazyListScope
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import com.schoolapp.core.designsystem.component.ErrorState
import com.schoolapp.core.designsystem.component.InlineMessage
import com.schoolapp.core.designsystem.component.LoadingState
import com.schoolapp.core.designsystem.component.RefreshBox
import com.schoolapp.core.designsystem.component.ScreenColumn
import com.schoolapp.core.designsystem.component.StatusTone
import com.schoolapp.core.model.notice.Notice
import com.schoolapp.core.ui.appErrorMessage

/** Loading / error / empty / paged rows with pull-to-refresh, for any [NoticePage]. */
@Composable
internal fun NoticeList(
    page: NoticePage,
    onRefresh: () -> Unit,
    onLoadMore: () -> Unit,
    empty: @Composable () -> Unit,
    row: @Composable (Notice) -> Unit,
    modifier: Modifier = Modifier,
    bottomPadding: Boolean = false,
    header: LazyListScope.() -> Unit = {},
) {
    when {
        page.isLoading -> LoadingState(modifier)
        page.error != null && page.items.isEmpty() -> ErrorState(appErrorMessage(page.error), modifier, onRetry = onRefresh)
        else -> RefreshBox(isRefreshing = page.isRefreshing, onRefresh = onRefresh, modifier = modifier) {
            ScreenColumn(contentPadding = PaddingValues(start = 16.dp, top = 16.dp, end = 16.dp, bottom = if (bottomPadding) 88.dp else 16.dp)) {
                header()
                page.error?.let { error -> item(key = "error") { InlineMessage(appErrorMessage(error), StatusTone.Error) } }
                if (page.items.isEmpty()) item(key = "empty") { empty() }
                items(page.items.size, key = { page.items[it].id }) { index -> row(page.items[index]) }
                if (page.hasMore) item(key = "more") { LoadMoreFooter(page, onLoadMore) }
            }
        }
    }
}
