package com.schoolapp.core.data.inventory

import com.schoolapp.core.common.result.AppResult
import com.schoolapp.core.model.inventory.Asset
import com.schoolapp.core.model.inventory.AssetInput
import com.schoolapp.core.model.inventory.InventoryItem
import com.schoolapp.core.model.inventory.InventoryPage
import com.schoolapp.core.model.inventory.ItemCategory
import com.schoolapp.core.model.inventory.ItemInput
import com.schoolapp.core.model.inventory.MovementInput
import com.schoolapp.core.model.inventory.SaleInput
import com.schoolapp.core.model.inventory.SaleResult
import com.schoolapp.core.model.inventory.StockLine
import com.schoolapp.core.model.inventory.StockMovement

/** Item catalogue, branch stock, movements, tagged assets and student sales. */
interface InventoryRepository {
    /** Up to 100 items of the branch's school, for pickers and name lookups. */
    suspend fun catalog(branchId: String): AppResult<List<InventoryItem>>

    suspend fun items(branchId: String, category: ItemCategory?, search: String?, page: Int): AppResult<InventoryPage<InventoryItem>>

    suspend fun createItem(input: ItemInput): AppResult<InventoryItem>

    suspend fun stock(branchId: String): AppResult<List<StockLine>>

    suspend fun movements(branchId: String, page: Int): AppResult<InventoryPage<StockMovement>>

    suspend fun recordMovement(input: MovementInput): AppResult<Unit>

    suspend fun assets(branchId: String, page: Int): AppResult<InventoryPage<Asset>>

    suspend fun createAsset(branchId: String, input: AssetInput): AppResult<Asset>

    suspend fun updateAsset(id: String, input: AssetInput): AppResult<Asset>

    /** Issues the items from stock and adds them to the student's fee invoice. */
    suspend fun recordSale(input: SaleInput): AppResult<SaleResult>
}
