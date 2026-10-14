package com.schoolapp.core.network.api.payroll.extras

import com.schoolapp.core.network.dto.payroll.extras.AdjustmentBodyDto
import com.schoolapp.core.network.dto.payroll.extras.AdjustmentDto
import com.schoolapp.core.network.dto.payroll.extras.CancelBodyDto
import com.schoolapp.core.network.dto.payroll.extras.DecideOvertimeBodyDto
import com.schoolapp.core.network.dto.payroll.extras.OvertimeBodyDto
import com.schoolapp.core.network.dto.payroll.extras.OvertimeListDto
import com.schoolapp.core.network.dto.payroll.extras.OvertimeMonthBodyDto
import com.schoolapp.core.network.dto.payroll.extras.OvertimeScanDto
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
import retrofit2.http.POST
import retrofit2.http.Path
import retrofit2.http.Query
import javax.inject.Singleton

/** Overtime entries and bonus / deduction adjustments of a payroll month. */
interface PayrollExtrasApi {
    @GET("payroll/overtime")
    suspend fun overtime(@Query("branchId") branchId: String, @Query("month") month: String): ApiEnvelope<OvertimeListDto>

    @POST("payroll/overtime")
    suspend fun addOvertime(@Body body: OvertimeBodyDto): ApiEnvelope<JsonObject>

    /** Finds late check-outs in staff attendance and turns them into PENDING entries. */
    @POST("payroll/overtime/scan")
    suspend fun scanOvertime(@Body body: OvertimeMonthBodyDto): ApiEnvelope<OvertimeScanDto>

    @POST("payroll/overtime/decide")
    suspend fun decideOvertime(@Body body: DecideOvertimeBodyDto): ApiEnvelope<JsonObject>

    @DELETE("payroll/overtime/{id}")
    suspend fun removeOvertime(@Path("id") id: String): ApiEnvelope<JsonObject>

    @GET("payroll/adjustments")
    suspend fun adjustments(
        @Query("branchId") branchId: String,
        @Query("month") month: String,
        @Query("staffId") staffId: String? = null,
        @Query("pageSize") pageSize: Int = PAGE_SIZE,
    ): ApiEnvelope<List<AdjustmentDto>>

    @POST("payroll/adjustments")
    suspend fun addAdjustment(@Body body: AdjustmentBodyDto): ApiEnvelope<AdjustmentDto>

    @POST("payroll/adjustments/{id}/cancel")
    suspend fun cancelAdjustment(@Path("id") id: String, @Body body: CancelBodyDto): ApiEnvelope<AdjustmentDto>

    companion object {
        const val PAGE_SIZE = 100
    }
}

@Module
@InstallIn(SingletonComponent::class)
object PayrollExtrasNetworkModule {
    @Provides
    @Singleton
    fun providePayrollExtrasApi(retrofit: Retrofit): PayrollExtrasApi = retrofit.create(PayrollExtrasApi::class.java)
}
