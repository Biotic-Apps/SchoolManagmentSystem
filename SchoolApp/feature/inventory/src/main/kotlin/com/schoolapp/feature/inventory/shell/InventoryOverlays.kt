package com.schoolapp.feature.inventory.shell

import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.outlined.Add
import androidx.compose.material.icons.outlined.AddShoppingCart
import androidx.compose.material.icons.outlined.SwapHoriz
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.res.stringResource
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import com.schoolapp.core.designsystem.component.AppFloatingButton
import com.schoolapp.feature.inventory.R
import com.schoolapp.feature.inventory.assets.AssetSheet
import com.schoolapp.feature.inventory.items.ItemSheet
import com.schoolapp.feature.inventory.movements.MovementSheet
import com.schoolapp.feature.inventory.purchasing.RequestSheet

/** The visible tab's main action, shown only when the role has the right for it. */
@Composable
internal fun InventoryFab(tab: InventoryTab, state: InventoryShellState, vms: InventoryViewModels, modifier: Modifier = Modifier) {
    val branchId = state.branchId ?: return
    val rights = state.rights
    when (tab) {
        InventoryTab.STOCK, InventoryTab.MOVEMENTS -> if (rights.canEdit) {
            AppFloatingButton(stringResource(R.string.inv_record_movement), Icons.Outlined.SwapHoriz, { vms.movementForm.open(branchId) }, modifier)
        }
        InventoryTab.ITEMS -> if (rights.canAdd) {
            AppFloatingButton(stringResource(R.string.inv_add_item), Icons.Outlined.Add, { vms.itemForm.open(state.schoolId) }, modifier)
        }
        InventoryTab.ASSETS -> if (rights.canEdit) {
            AppFloatingButton(stringResource(R.string.inv_add_asset), Icons.Outlined.Add, { vms.assetForm.open(branchId, null) }, modifier)
        }
        InventoryTab.PURCHASING -> if (rights.canAdd) {
            AppFloatingButton(stringResource(R.string.inv_new_request), Icons.Outlined.AddShoppingCart, { vms.requestForm.open(branchId) }, modifier)
        }
        InventoryTab.SALES -> Unit
    }
}

/** Form sheets; each is shown while its view model says it is open. */
@Composable
internal fun InventorySheets(state: InventoryShellState, vms: InventoryViewModels) {
    val item by vms.itemForm.uiState.collectAsStateWithLifecycle()
    val movement by vms.movementForm.uiState.collectAsStateWithLifecycle()
    val asset by vms.assetForm.uiState.collectAsStateWithLifecycle()
    val request by vms.requestForm.uiState.collectAsStateWithLifecycle()
    if (item.open) ItemSheet(item, vms.itemForm)
    if (movement.open) MovementSheet(movement, state.catalog, state.otherBranches, vms.movementForm)
    if (asset.open) AssetSheet(asset, state.catalog, vms.assetForm)
    if (request.open) RequestSheet(request, state.catalog, vms.requestForm)
}
