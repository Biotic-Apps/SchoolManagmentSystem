package com.schoolapp.feature.inventory.shell

import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.ui.Modifier
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import com.schoolapp.feature.inventory.PurchaseRequestDestination
import com.schoolapp.feature.inventory.assets.AssetsTab
import com.schoolapp.feature.inventory.items.ItemsActions
import com.schoolapp.feature.inventory.items.ItemsTab
import com.schoolapp.feature.inventory.movements.MovementsTab
import com.schoolapp.feature.inventory.purchasing.PurchasingActions
import com.schoolapp.feature.inventory.purchasing.PurchasingTab
import com.schoolapp.feature.inventory.sales.SalesTab
import com.schoolapp.feature.inventory.stock.StockTab

@Composable
internal fun InventoryTabContent(
    tab: InventoryTab,
    state: InventoryShellState,
    vms: InventoryViewModels,
    onOpen: (Any) -> Unit,
    modifier: Modifier = Modifier,
) {
    when (tab) {
        InventoryTab.STOCK -> {
            val stock by vms.stock.uiState.collectAsStateWithLifecycle()
            StockTab(stock, vms.stock::retry, vms.stock::refresh, vms.stock::onLowOnlyChange, modifier)
        }
        InventoryTab.ITEMS -> {
            val list by vms.items.list.collectAsStateWithLifecycle()
            val filters by vms.items.filters.collectAsStateWithLifecycle()
            ItemsTab(
                state = list,
                filters = filters,
                actions = ItemsActions(vms.items::retry, vms.items::refresh, vms.items::loadMore, vms.items::onSearch, vms.items::onCategory),
                modifier = modifier,
            )
        }
        InventoryTab.MOVEMENTS -> {
            val list by vms.movements.list.collectAsStateWithLifecycle()
            MovementsTab(list, vms.movements::retry, vms.movements::refresh, vms.movements::loadMore, modifier)
        }
        InventoryTab.ASSETS -> {
            val list by vms.assets.list.collectAsStateWithLifecycle()
            val branchId = state.branchId
            AssetsTab(
                state = list,
                onRetry = vms.assets::retry,
                onRefresh = vms.assets::refresh,
                onLoadMore = vms.assets::loadMore,
                onEdit = if (state.rights.canEdit && branchId != null) ({ vms.assetForm.open(branchId, it) }) else null,
                modifier = modifier,
            )
        }
        InventoryTab.PURCHASING -> {
            val list by vms.purchasing.list.collectAsStateWithLifecycle()
            val status by vms.purchasing.status.collectAsStateWithLifecycle()
            PurchasingTab(
                state = list,
                status = status,
                actions = PurchasingActions(
                    onRetry = vms.purchasing::retry,
                    onRefresh = vms.purchasing::refresh,
                    onLoadMore = vms.purchasing::loadMore,
                    onStatus = vms.purchasing::onStatus,
                    onOpen = { onOpen(PurchaseRequestDestination(it.id, state.schoolId)) },
                ),
                modifier = modifier,
            )
        }
        InventoryTab.SALES -> {
            val sales by vms.sales.uiState.collectAsStateWithLifecycle()
            SalesTab(sales, state.catalog, vms.sales, modifier)
        }
    }
}
