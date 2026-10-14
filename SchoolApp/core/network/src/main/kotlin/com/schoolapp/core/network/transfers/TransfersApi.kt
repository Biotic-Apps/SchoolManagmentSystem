package com.schoolapp.core.network.transfers

import com.schoolapp.core.network.model.ApiEnvelope
import retrofit2.http.Body
import retrofit2.http.GET
import retrofit2.http.POST
import retrofit2.http.Path
import retrofit2.http.Query

/** Branch-to-branch student transfers inbox (`students.view`; decisions need `students.edit`). */
interface TransfersApi {
    @GET("transfers")
    suspend fun transfers(
        @Query("page") page: Int,
        @Query("branchId") branchId: String? = null,
        @Query("direction") direction: String? = null,
        @Query("status") status: String? = null,
        @Query("pageSize") pageSize: Int = PAGE_SIZE,
    ): ApiEnvelope<List<TransferDto>>

    @POST("transfers/{id}/accept")
    suspend fun accept(@Path("id") id: String, @Body body: AcceptTransferBodyDto): ApiEnvelope<TransferDto>

    @POST("transfers/{id}/reject")
    suspend fun reject(@Path("id") id: String, @Body body: TransferReasonBodyDto): ApiEnvelope<TransferDto>

    @POST("transfers/{id}/cancel")
    suspend fun cancel(@Path("id") id: String, @Body body: TransferReasonBodyDto): ApiEnvelope<TransferDto>

    companion object {
        const val PAGE_SIZE = 30
    }
}
