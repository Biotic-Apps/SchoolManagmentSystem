package com.schoolapp.feature.inventory.movements

import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.outlined.SwapHoriz
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.res.stringResource
import com.schoolapp.core.designsystem.component.EmptyState
import com.schoolapp.core.model.inventory.StockMovement
import com.schoolapp.feature.inventory.R
import com.schoolapp.feature.inventory.components.PagedListContent
import com.schoolapp.feature.inventory.list.PagedList

@Composable
internal fun MovementsTab(
    state: PagedList<StockMovement>,
    onRetry: () -> Unit,
    onRefresh: () -> Unit,
    onLoadMore: () -> Unit,
    modifier: Modifier = Modifier,
) {
    PagedListContent(
        state = state,
        onRetry = onRetry,
        onRefresh = onRefresh,
        onLoadMore = onLoadMore,
        key = { it.id },
        modifier = modifier,
        empty = {
            EmptyState(
                stringResource(R.string.inv_movements_empty),
                message = stringResource(R.string.inv_movements_empty_message),
                icon = Icons.Outlined.SwapHoriz,
            )
        },
    ) { MovementRow(it) }
}
