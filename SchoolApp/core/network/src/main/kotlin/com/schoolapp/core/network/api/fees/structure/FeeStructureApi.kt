package com.schoolapp.core.network.api.fees.structure

import com.schoolapp.core.network.dto.fees.structure.ArchiveBodyDto
import com.schoolapp.core.network.dto.fees.structure.FeeHeadBodyDto
import com.schoolapp.core.network.dto.fees.structure.FeeHeadDto
import com.schoolapp.core.network.dto.fees.structure.FeePlanDto
import com.schoolapp.core.network.dto.fees.structure.SiblingDiscountBodyDto
import com.schoolapp.core.network.dto.fees.structure.SiblingDiscountDto
import com.schoolapp.core.network.dto.fees.structure.SiblingPercentBodyDto
import com.schoolapp.core.network.model.ApiEnvelope
import dagger.Module
import dagger.Provides
import dagger.hilt.InstallIn
import dagger.hilt.components.SingletonComponent
import kotlinx.serialization.json.JsonObject
import retrofit2.Retrofit
import retrofit2.http.Body
import retrofit2.http.DELETE
import retrofit2.http.GET
import retrofit2.http.PATCH
import retrofit2.http.POST
import retrofit2.http.Path
import retrofit2.http.Query
import javax.inject.Singleton

/** Fee heads (per school), fee plans (per branch, session and class) and sibling discounts (per school). */
interface FeeStructureApi {
    @GET("fee-heads")
    suspend fun feeHeads(@Query("schoolId") schoolId: String?, @Query("pageSize") pageSize: Int = PAGE_SIZE): ApiEnvelope<List<FeeHeadDto>>

    @POST("fee-heads")
    suspend fun createFeeHead(@Body body: FeeHeadBodyDto): ApiEnvelope<FeeHeadDto>

    @GET("fee-plans")
    suspend fun feePlans(
        @Query("branchId") branchId: String,
        @Query("sessionId") sessionId: String,
        @Query("pageSize") pageSize: Int = PAGE_SIZE,
    ): ApiEnvelope<List<FeePlanDto>>

    /** Body built as JSON so `lateFee: null` is sent explicitly. */
    @POST("fee-plans")
    suspend fun createFeePlan(@Body body: JsonObject): ApiEnvelope<FeePlanDto>

    @PATCH("fee-plans/{id}")
    suspend fun updateFeePlan(@Path("id") id: String, @Body body: JsonObject): ApiEnvelope<FeePlanDto>

    @POST("fee-plans/{id}/approve")
    suspend fun approveFeePlan(@Path("id") id: String): ApiEnvelope<JsonObject>

    @POST("fee-plans/{id}/archive")
    suspend fun archiveFeePlan(@Path("id") id: String, @Body body: ArchiveBodyDto): ApiEnvelope<JsonObject>

    @GET("sibling-discounts")
    suspend fun siblingDiscounts(@Query("schoolId") schoolId: String?): ApiEnvelope<List<SiblingDiscountDto>>

    @POST("sibling-discounts")
    suspend fun createSiblingDiscount(@Body body: SiblingDiscountBodyDto): ApiEnvelope<SiblingDiscountDto>

    @PATCH("sibling-discounts/{id}")
    suspend fun updateSiblingDiscount(@Path("id") id: String, @Body body: SiblingPercentBodyDto): ApiEnvelope<SiblingDiscountDto>

    @DELETE("sibling-discounts/{id}")
    suspend fun deleteSiblingDiscount(@Path("id") id: String): ApiEnvelope<JsonObject>

    companion object {
        const val PAGE_SIZE = 100
    }
}

@Module
@InstallIn(SingletonComponent::class)
object FeeStructureNetworkModule {
    @Provides
    @Singleton
    fun provideFeeStructureApi(retrofit: Retrofit): FeeStructureApi = retrofit.create(FeeStructureApi::class.java)
}
