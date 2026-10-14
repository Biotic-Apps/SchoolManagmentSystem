package com.schoolapp.feature.inventory.components

import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.lazy.LazyListScope
import androidx.compose.foundation.lazy.items
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.unit.dp
import com.schoolapp.core.designsystem.component.AppTextButton
import com.schoolapp.core.designsystem.component.ErrorState
import com.schoolapp.core.designsystem.component.InlineMessage
import com.schoolapp.core.designsystem.component.LoadingState
import com.schoolapp.core.designsystem.component.PullableState
import com.schoolapp.core.designsystem.component.RefreshBox
import com.schoolapp.core.designsystem.component.ScreenColumn
import com.schoolapp.core.designsystem.component.StatusTone
import com.schoolapp.core.ui.appErrorMessage
import com.schoolapp.feature.inventory.R
import com.schoolapp.feature.inventory.list.PagedList

/** Bottom padding that keeps the last row clear of a floating button. */
internal val FabClearance = 96.dp

/**
 * Pull-to-refresh list with loading, error (retry), empty and "Load more" states.
 * [header] items (filters, notices) stay visible in every state except the first load.
 */
@Composable
internal fun <T> PagedListContent(
    state: PagedList<T>,
    onRetry: () -> Unit,
    onRefresh: () -> Unit,
    onLoadMore: () -> Unit,
    key: (T) -> Any,
    empty: @Composable () -> Unit,
    modifier: Modifier = Modifier,
    header: LazyListScope.() -> Unit = {},
    row: @Composable (T) -> Unit,
) {
    RefreshBox(state.isRefreshing, onRefresh, modifier.fillMaxSize()) {
        when {
            state.error != null && state.items.isEmpty() && !state.isLoading ->
                PullableState { ErrorState(appErrorMessage(state.error), onRetry = onRetry) }
            else -> ScreenColumn(contentPadding = PaddingValues(start = 16.dp, top = 12.dp, end = 16.dp, bottom = FabClearance), itemSpacing = 12.dp) {
                header()
                when {
                    state.isLoading -> item(key = "loading") { LoadingState() }
                    state.items.isEmpty() -> item(key = "empty") { empty() }
                    else -> {
                        items(state.items, key = { "row_${key(it)}" }) { row(it) }
                        state.error?.let { error ->
                            item(key = "more_error") { InlineMessage(appErrorMessage(error), StatusTone.Error) }
                        }
                        if (state.hasMore) item(key = "more") { LoadMoreRow(state.isLoadingMore, onLoadMore) }
                    }
                }
            }
        }
    }
}

@Composable
private fun LoadMoreRow(loading: Boolean, onLoadMore: () -> Unit) {
    Box(Modifier.fillMaxWidth(), contentAlignment = Alignment.Center) {
        AppTextButton(stringResource(R.string.inv_load_more), onLoadMore, loading = loading)
    }
}
