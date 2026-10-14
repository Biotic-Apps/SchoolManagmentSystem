package com.schoolapp.feature.expenses.vendors

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.outlined.Storefront
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.unit.dp
import com.schoolapp.core.designsystem.component.AppTextButton
import com.schoolapp.core.designsystem.component.EmptyState
import com.schoolapp.core.designsystem.component.ErrorState
import com.schoolapp.core.designsystem.component.InlineMessage
import com.schoolapp.core.designsystem.component.LoadingState
import com.schoolapp.core.designsystem.component.RefreshBox
import com.schoolapp.core.designsystem.component.ScreenColumn
import com.schoolapp.core.designsystem.component.SearchField
import com.schoolapp.core.designsystem.component.StatusTone
import com.schoolapp.core.ui.loadErrorMessage
import com.schoolapp.feature.expenses.R

internal class VendorsActions(
    val onSearch: (String) -> Unit,
    val onRefresh: () -> Unit,
    val onLoadMore: () -> Unit,
    val onRetryMore: () -> Unit,
    val onCall: (String) -> Unit,
    val onEmail: (String) -> Unit,
)

/** Suppliers of the school, searchable by name. */
@Composable
internal fun VendorsTab(state: VendorsUiState, actions: VendorsActions, bottomSpace: PaddingValues) {
    Column(Modifier.fillMaxSize()) {
        SearchField(
            value = state.search,
            onValueChange = actions.onSearch,
            placeholder = stringResource(R.string.expenses_search_vendors),
            modifier = Modifier.fillMaxWidth().padding(start = 16.dp, top = 12.dp, end = 16.dp),
        )
        when {
            state.isLoading -> LoadingState()
            state.error != null && state.items.isEmpty() -> ErrorState(loadErrorMessage(state.error), onRetry = actions.onRefresh)
            state.items.isEmpty() -> EmptyState(
                title = stringResource(if (state.search.isBlank()) R.string.expenses_vendors_empty else R.string.expenses_vendors_no_match),
                message = stringResource(R.string.expenses_vendors_empty_message),
                icon = Icons.Outlined.Storefront,
            )
            else -> RefreshBox(isRefreshing = state.isRefreshing, onRefresh = actions.onRefresh) {
                ScreenColumn(
                    contentPadding = PaddingValues(start = 16.dp, top = 12.dp, end = 16.dp, bottom = 16.dp + bottomSpace.calculateBottomPadding()),
                    itemSpacing = 12.dp,
                ) {
                    state.error?.let { error -> item(key = "error") { InlineMessage(loadErrorMessage(error), StatusTone.Error) } }
                    items(state.items.size, key = { state.items[it].id }) { index ->
                        VendorCard(state.items[index], onCall = actions.onCall, onEmail = actions.onEmail)
                    }
                    if (state.hasMore) item(key = "more") { MoreRow(state, actions) }
                }
            }
        }
    }
}

@Composable
private fun MoreRow(state: VendorsUiState, actions: VendorsActions) {
    val error = state.loadMoreError
    if (error != null) {
        Column(verticalArrangement = Arrangement.spacedBy(8.dp)) {
            InlineMessage(loadErrorMessage(error), StatusTone.Error)
            AppTextButton(stringResource(R.string.expenses_retry), onClick = actions.onRetryMore)
        }
        return
    }
    LaunchedEffect(state.page) { actions.onLoadMore() }
    Box(Modifier.fillMaxWidth().padding(8.dp), contentAlignment = Alignment.Center) { CircularProgressIndicator() }
}
