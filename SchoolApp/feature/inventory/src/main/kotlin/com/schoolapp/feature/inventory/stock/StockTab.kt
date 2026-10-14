package com.schoolapp.feature.inventory.stock

import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.lazy.items
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.outlined.Inventory2
import androidx.compose.material.icons.outlined.TaskAlt
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.unit.dp
import com.schoolapp.core.designsystem.component.AppCard
import com.schoolapp.core.designsystem.component.EmptyState
import com.schoolapp.core.designsystem.component.ErrorState
import com.schoolapp.core.designsystem.component.LoadingState
import com.schoolapp.core.designsystem.component.PullableState
import com.schoolapp.core.designsystem.component.RefreshBox
import com.schoolapp.core.designsystem.component.ScreenColumn
import com.schoolapp.core.designsystem.component.SwitchRow
import com.schoolapp.core.designsystem.theme.AppColors
import com.schoolapp.core.ui.appErrorMessage
import com.schoolapp.feature.inventory.R
import com.schoolapp.feature.inventory.components.FabClearance

@Composable
internal fun StockTab(
    state: StockUiState,
    onRetry: () -> Unit,
    onRefresh: () -> Unit,
    onLowOnlyChange: (Boolean) -> Unit,
    modifier: Modifier = Modifier,
) {
    RefreshBox(state.isRefreshing, onRefresh, modifier.fillMaxSize()) {
        when {
            state.isLoading -> LoadingState()
            state.error != null && state.lines.isEmpty() -> PullableState { ErrorState(appErrorMessage(state.error), onRetry = onRetry) }
            else -> ScreenColumn(contentPadding = PaddingValues(start = 16.dp, top = 12.dp, end = 16.dp, bottom = FabClearance), itemSpacing = 12.dp) {
                item(key = "summary") { StockSummary(state, onLowOnlyChange) }
                val shown = state.shown
                if (shown.isEmpty()) {
                    item(key = "empty") {
                        if (state.lowOnly) {
                            EmptyState(stringResource(R.string.inv_low_empty), message = stringResource(R.string.inv_low_empty_message), icon = Icons.Outlined.TaskAlt)
                        } else {
                            EmptyState(stringResource(R.string.inv_stock_empty), message = stringResource(R.string.inv_stock_empty_message), icon = Icons.Outlined.Inventory2)
                        }
                    }
                }
                items(shown, key = { "stock_${it.item.id}" }) { StockRow(it) }
            }
        }
    }
}

@Composable
private fun StockSummary(state: StockUiState, onLowOnlyChange: (Boolean) -> Unit) {
    AppCard(verticalSpacing = 4.dp) {
        Text(
            stringResource(R.string.inv_stock_summary, state.lines.size, state.lowCount),
            style = MaterialTheme.typography.bodyMedium,
            color = if (state.lowCount > 0) AppColors.Warning else AppColors.TextSecondary,
        )
        SwitchRow(stringResource(R.string.inv_low_only), state.lowOnly, onLowOnlyChange)
    }
}
