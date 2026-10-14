package com.schoolapp.core.network.api.inventory

import com.schoolapp.core.network.api.Paging
import com.schoolapp.core.network.dto.inventory.CreateVendorBody
import com.schoolapp.core.network.dto.inventory.PurchaseOrderBody
import com.schoolapp.core.network.dto.inventory.PurchaseOrderDto
import com.schoolapp.core.network.dto.inventory.PurchaseRequestBody
import com.schoolapp.core.network.dto.inventory.PurchaseRequestDto
import com.schoolapp.core.network.dto.inventory.ReceiveBody
import com.schoolapp.core.network.dto.inventory.VendorDto
import com.schoolapp.core.network.model.ApiEnvelope
import kotlinx.serialization.json.JsonElement
import retrofit2.http.Body
import retrofit2.http.GET
import retrofit2.http.POST
import retrofit2.http.Path
import retrofit2.http.Query

/** Purchase requests (approved in Approvals), purchase orders, goods receipt and vendor billing. */
interface PurchasingApi {
    @GET("purchase-requests")
    suspend fun requests(
        @Query("branchId") branchId: String,
        @Query("status") status: String? = null,
        @Query("page") page: Int = 1,
        @Query("pageSize") pageSize: Int = InventoryApi.PAGE_SIZE,
    ): ApiEnvelope<List<PurchaseRequestDto>>

    @GET("purchase-requests/{id}")
    suspend fun request(@Path("id") id: String): ApiEnvelope<PurchaseRequestDto>

    @POST("purchase-requests")
    suspend fun createRequest(@Body body: PurchaseRequestBody): ApiEnvelope<PurchaseRequestDto>

    @POST("purchase-requests/{id}/order")
    suspend fun createOrder(@Path("id") requestId: String, @Body body: PurchaseOrderBody): ApiEnvelope<PurchaseOrderDto>

    @GET("purchase-orders/{id}")
    suspend fun order(@Path("id") id: String): ApiEnvelope<PurchaseOrderDto>

    @POST("purchase-orders/{id}/receive")
    suspend fun receive(@Path("id") orderId: String, @Body body: ReceiveBody): ApiEnvelope<PurchaseOrderDto>

    /** Creates the vendor bill (an expense) for the order. */
    @POST("purchase-orders/{id}/bill")
    suspend fun bill(@Path("id") orderId: String): ApiEnvelope<JsonElement>

    @GET("vendors")
    suspend fun vendors(
        @Query("branchId") branchId: String?,
        @Query("page") page: Int = 1,
        @Query("pageSize") pageSize: Int = Paging.MAX_PAGE_SIZE,
    ): ApiEnvelope<List<VendorDto>>

    @POST("vendors")
    suspend fun createVendor(@Body body: CreateVendorBody): ApiEnvelope<VendorDto>
}
