package com.schoolapp.feature.inventory.shell

import androidx.compose.runtime.Composable
import androidx.compose.runtime.Stable
import androidx.compose.runtime.remember
import androidx.hilt.lifecycle.viewmodel.compose.hiltViewModel
import com.schoolapp.feature.inventory.assets.AssetFormViewModel
import com.schoolapp.feature.inventory.assets.AssetsViewModel
import com.schoolapp.feature.inventory.components.SavedMessage
import com.schoolapp.feature.inventory.items.ItemFormViewModel
import com.schoolapp.feature.inventory.items.ItemsViewModel
import com.schoolapp.feature.inventory.movements.MovementFormViewModel
import com.schoolapp.feature.inventory.movements.MovementsViewModel
import com.schoolapp.feature.inventory.purchasing.PurchasingViewModel
import com.schoolapp.feature.inventory.purchasing.RequestFormViewModel
import com.schoolapp.feature.inventory.sales.SalesViewModel
import com.schoolapp.feature.inventory.stock.StockViewModel
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.merge

/** Every view model of the menu, keyed by role so switching role starts fresh. */
@Stable
internal class InventoryViewModels(
    val shell: InventoryShellViewModel,
    val stock: StockViewModel,
    val items: ItemsViewModel,
    val movements: MovementsViewModel,
    val assets: AssetsViewModel,
    val purchasing: PurchasingViewModel,
    val sales: SalesViewModel,
    val itemForm: ItemFormViewModel,
    val movementForm: MovementFormViewModel,
    val assetForm: AssetFormViewModel,
    val requestForm: RequestFormViewModel,
) {
    /** Success messages of every form; each one reloads the tabs. */
    val saved: Flow<SavedMessage> = merge(itemForm.saved, movementForm.saved, assetForm.saved, requestForm.saved, sales.saved)

    /** Binds the visible tab to the branch and change version (fetches only when either moved). */
    fun bind(tab: InventoryTab, branchId: String, version: Int) = when (tab) {
        InventoryTab.STOCK -> stock.bind(branchId, version)
        InventoryTab.ITEMS -> items.bind(branchId, version)
        InventoryTab.MOVEMENTS -> movements.bind(branchId, version)
        InventoryTab.ASSETS -> assets.bind(branchId, version)
        InventoryTab.PURCHASING -> purchasing.bind(branchId, version)
        InventoryTab.SALES -> Unit
    }
}

@Composable
internal fun rememberInventoryViewModels(roleKey: String): InventoryViewModels {
    val shell: InventoryShellViewModel = hiltViewModel(key = "inv_shell_$roleKey")
    val stock: StockViewModel = hiltViewModel(key = "inv_stock_$roleKey")
    val items: ItemsViewModel = hiltViewModel(key = "inv_items_$roleKey")
    val movements: MovementsViewModel = hiltViewModel(key = "inv_movements_$roleKey")
    val assets: AssetsViewModel = hiltViewModel(key = "inv_assets_$roleKey")
    val purchasing: PurchasingViewModel = hiltViewModel(key = "inv_purchasing_$roleKey")
    val sales: SalesViewModel = hiltViewModel(key = "inv_sales_$roleKey")
    val itemForm: ItemFormViewModel = hiltViewModel(key = "inv_item_form_$roleKey")
    val movementForm: MovementFormViewModel = hiltViewModel(key = "inv_movement_form_$roleKey")
    val assetForm: AssetFormViewModel = hiltViewModel(key = "inv_asset_form_$roleKey")
    val requestForm: RequestFormViewModel = hiltViewModel(key = "inv_request_form_$roleKey")
    return remember(shell, stock, items, movements, assets, purchasing, sales, itemForm, movementForm, assetForm, requestForm) {
        InventoryViewModels(shell, stock, items, movements, assets, purchasing, sales, itemForm, movementForm, assetForm, requestForm)
    }
}
