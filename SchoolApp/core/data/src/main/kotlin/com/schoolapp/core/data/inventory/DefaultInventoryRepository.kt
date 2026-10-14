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
import com.schoolapp.core.network.ApiCaller
import com.schoolapp.core.network.api.inventory.InventoryApi
import com.schoolapp.core.network.dto.inventory.SaleBody
import com.schoolapp.core.network.dto.inventory.UpdateAssetBody
import javax.inject.Inject
import javax.inject.Singleton

@Singleton
class DefaultInventoryRepository @Inject constructor(
    private val api: InventoryApi,
    private val apiCaller: ApiCaller,
) : InventoryRepository {

    override suspend fun catalog(branchId: String): AppResult<List<InventoryItem>> =
        apiCaller.call { api.items(branchId).data.map { it.toModel() }.sortedBy { it.name.lowercase() } }

    override suspend fun items(branchId: String, category: ItemCategory?, search: String?, page: Int): AppResult<InventoryPage<InventoryItem>> =
        apiCaller.call {
            api.items(branchId, category?.name, search?.trim()?.takeIf { it.isNotEmpty() }, page, InventoryApi.PAGE_SIZE)
                .toPage(page, InventoryApi.PAGE_SIZE) { it.toModel() }
        }

    override suspend fun createItem(input: ItemInput): AppResult<InventoryItem> =
        apiCaller.call { api.createItem(input.toBody()).data.toModel() }

    override suspend fun stock(branchId: String): AppResult<List<StockLine>> =
        apiCaller.call { api.stock(branchId).data.map { it.toModel() }.sortedBy { it.item.name.lowercase() } }

    override suspend fun movements(branchId: String, page: Int): AppResult<InventoryPage<StockMovement>> =
        apiCaller.call { api.movements(branchId, page).toPage(page, InventoryApi.PAGE_SIZE) { it.toModel() } }

    override suspend fun recordMovement(input: MovementInput): AppResult<Unit> =
        apiCaller.call { api.recordMovement(input.toBody()); Unit }

    override suspend fun assets(branchId: String, page: Int): AppResult<InventoryPage<Asset>> =
        apiCaller.call { api.assets(branchId, page).toPage(page, InventoryApi.PAGE_SIZE) { it.toModel() } }

    override suspend fun createAsset(branchId: String, input: AssetInput): AppResult<Asset> =
        apiCaller.call { api.createAsset(branchId, input.toCreateBody(branchId)).data.toModel() }

    override suspend fun updateAsset(id: String, input: AssetInput): AppResult<Asset> =
        apiCaller.call {
            api.updateAsset(id, UpdateAssetBody(input.location, input.condition.name, input.assignedTo.orEmpty())).data.toModel()
        }

    override suspend fun recordSale(input: SaleInput): AppResult<SaleResult> =
        apiCaller.call {
            val sale = api.recordSale(SaleBody(input.studentId, input.lines.toBodies())).data
            SaleResult(sale.invoiceNo, sale.totalMinor)
        }
}
