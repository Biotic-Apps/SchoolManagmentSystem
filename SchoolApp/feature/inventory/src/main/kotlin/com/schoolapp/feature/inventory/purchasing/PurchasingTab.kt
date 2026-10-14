package com.schoolapp.feature.inventory.purchasing

import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.outlined.ShoppingCart
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.res.stringResource
import com.schoolapp.core.designsystem.component.EmptyState
import com.schoolapp.core.designsystem.component.FilterChipRow
import com.schoolapp.core.designsystem.component.SwitcherOption
import com.schoolapp.core.model.inventory.PurchaseRequest
import com.schoolapp.core.model.inventory.PurchaseRequestStatus
import com.schoolapp.feature.inventory.R
import com.schoolapp.feature.inventory.components.PagedListContent
import com.schoolapp.feature.inventory.components.label
import com.schoolapp.feature.inventory.list.PagedList

internal class PurchasingActions(
    val onRetry: () -> Unit,
    val onRefresh: () -> Unit,
    val onLoadMore: () -> Unit,
    val onStatus: (PurchaseRequestStatus?) -> Unit,
    val onOpen: (PurchaseRequest) -> Unit,
)

@Composable
internal fun PurchasingTab(
    state: PagedList<PurchaseRequest>,
    status: PurchaseRequestStatus?,
    actions: PurchasingActions,
    modifier: Modifier = Modifier,
) {
    val filters = listOf(SwitcherOption(ALL, stringResource(R.string.inv_all))) +
        FILTERS.map { SwitcherOption(it.name, stringResource(it.label())) }
    PagedListContent(
        state = state,
        onRetry = actions.onRetry,
        onRefresh = actions.onRefresh,
        onLoadMore = actions.onLoadMore,
        key = { it.id },
        modifier = modifier,
        header = {
            item(key = "status") {
                FilterChipRow(filters, status?.name ?: ALL, { id ->
                    actions.onStatus(FILTERS.firstOrNull { it.name == id })
                })
            }
        },
        empty = {
            EmptyState(
                stringResource(R.string.inv_requests_empty),
                message = stringResource(R.string.inv_requests_empty_message),
                icon = Icons.Outlined.ShoppingCart,
            )
        },
    ) { request -> RequestRow(request, onClick = { actions.onOpen(request) }) }
}

private const val ALL = "ALL"
private val FILTERS = listOf(
    PurchaseRequestStatus.PENDING,
    PurchaseRequestStatus.APPROVED,
    PurchaseRequestStatus.REJECTED,
    PurchaseRequestStatus.ORDERED,
)
