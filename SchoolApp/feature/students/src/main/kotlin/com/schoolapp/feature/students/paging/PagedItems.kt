package com.schoolapp.feature.students.paging

import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.lazy.LazyListScope
import androidx.compose.foundation.lazy.LazyListState
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.rememberUpdatedState
import androidx.compose.runtime.snapshotFlow
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.unit.dp
import com.schoolapp.core.designsystem.component.AppTextButton
import com.schoolapp.core.designsystem.component.ErrorState
import com.schoolapp.core.designsystem.component.InlineMessage
import com.schoolapp.core.designsystem.component.LoadingState
import com.schoolapp.core.designsystem.component.StatusTone
import com.schoolapp.core.designsystem.component.dataListItems
import com.schoolapp.core.designsystem.theme.AppColors
import com.schoolapp.core.ui.appErrorMessage
import com.schoolapp.feature.students.R
import kotlinx.coroutines.flow.distinctUntilChanged
import kotlinx.coroutines.flow.filter

/**
 * Adds a [Paged] list to a page column (use `itemSpacing = 0.dp`): first-load spinner, full error with retry,
 * empty state, the rows as one card, then a next-page spinner or a retry row.
 */
fun <T> LazyListScope.pagedItems(
    paged: Paged<T>,
    key: (T) -> Any,
    onRetry: () -> Unit,
    onLoadMore: () -> Unit,
    empty: @Composable () -> Unit,
    row: @Composable (T) -> Unit,
) {
    when {
        paged.isLoading -> item(key = "paged_loading") { LoadingState() }
        paged.error != null && paged.items.isEmpty() ->
            item(key = "paged_error") { ErrorState(appErrorMessage(paged.error), onRetry = onRetry) }
        else -> {
            dataListItems(items = paged.items, key = key, emptyContent = empty, itemContent = row)
            if (paged.isLoadingMore) {
                item(key = "paged_more") {
                    Box(Modifier.fillMaxWidth().padding(16.dp), contentAlignment = Alignment.Center) {
                        CircularProgressIndicator(color = AppColors.Primary)
                    }
                }
            }
            paged.moreError?.let { error ->
                item(key = "paged_more_error") {
                    Column(Modifier.padding(top = 12.dp)) {
                        InlineMessage(appErrorMessage(error), StatusTone.Error)
                        AppTextButton(stringResource(R.string.students_retry), onClick = { if (paged.hasMore) onLoadMore() else onRetry() })
                    }
                }
            }
        }
    }
}

/** Calls [onLoadMore] when the user scrolls within a few rows of the end. */
@Composable
fun LoadMoreOnScroll(listState: LazyListState, onLoadMore: () -> Unit) {
    val load = rememberUpdatedState(onLoadMore)
    LaunchedEffect(listState) {
        snapshotFlow {
            val info = listState.layoutInfo
            val last = info.visibleItemsInfo.lastOrNull()?.index ?: -1
            // Keyed by the row count so a short page that leaves the end in view still asks for the next one.
            if (info.totalItemsCount > 0 && last >= info.totalItemsCount - PREFETCH_ROWS) info.totalItemsCount else -1
        }.distinctUntilChanged().filter { it > 0 }.collect { load.value() }
    }
}

private const val PREFETCH_ROWS = 4
