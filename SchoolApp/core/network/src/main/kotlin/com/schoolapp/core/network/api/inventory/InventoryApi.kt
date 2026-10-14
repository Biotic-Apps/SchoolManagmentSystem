package com.schoolapp.core.network.api.inventory

import com.schoolapp.core.network.api.Paging
import com.schoolapp.core.network.dto.inventory.AssetDto
import com.schoolapp.core.network.dto.inventory.CreateAssetBody
import com.schoolapp.core.network.dto.inventory.CreateItemBody
import com.schoolapp.core.network.dto.inventory.ItemDto
import com.schoolapp.core.network.dto.inventory.MovementBody
import com.schoolapp.core.network.dto.inventory.MovementDto
import com.schoolapp.core.network.dto.inventory.SaleBody
import com.schoolapp.core.network.dto.inventory.SaleDto
import com.schoolapp.core.network.dto.inventory.StockRowDto
import com.schoolapp.core.network.dto.inventory.UpdateAssetBody
import com.schoolapp.core.network.model.ApiEnvelope
import kotlinx.serialization.json.JsonElement
import retrofit2.http.Body
import retrofit2.http.GET
import retrofit2.http.PATCH
import retrofit2.http.POST
import retrofit2.http.Path
import retrofit2.http.Query

/** Items, stock, movements, tagged assets and student sales (phase 4 contract section E). */
interface InventoryApi {
    @GET("inventory/items")
    suspend fun items(
        @Query("branchId") branchId: String?,
        @Query("category") category: String? = null,
        @Query("search") search: String? = null,
        @Query("page") page: Int = 1,
        @Query("pageSize") pageSize: Int = Paging.MAX_PAGE_SIZE,
    ): ApiEnvelope<List<ItemDto>>

    @POST("inventory/items")
    suspend fun createItem(@Body body: CreateItemBody): ApiEnvelope<ItemDto>

    @GET("inventory/stock")
    suspend fun stock(@Query("branchId") branchId: String): ApiEnvelope<List<StockRowDto>>

    @GET("inventory/movements")
    suspend fun movements(
        @Query("branchId") branchId: String,
        @Query("page") page: Int = 1,
        @Query("pageSize") pageSize: Int = PAGE_SIZE,
    ): ApiEnvelope<List<MovementDto>>

    @POST("inventory/movements")
    suspend fun recordMovement(@Body body: MovementBody): ApiEnvelope<JsonElement>

    @GET("assets")
    suspend fun assets(
        @Query("branchId") branchId: String,
        @Query("page") page: Int = 1,
        @Query("pageSize") pageSize: Int = PAGE_SIZE,
    ): ApiEnvelope<List<AssetDto>>

    @POST("assets")
    suspend fun createAsset(@Query("branchId") branchId: String, @Body body: CreateAssetBody): ApiEnvelope<AssetDto>

    @PATCH("assets/{id}")
    suspend fun updateAsset(@Path("id") id: String, @Body body: UpdateAssetBody): ApiEnvelope<AssetDto>

    @POST("inventory/sales")
    suspend fun recordSale(@Body body: SaleBody): ApiEnvelope<SaleDto>

    companion object {
        const val PAGE_SIZE = 30
    }
}
