package com.schoolapp.core.network.api

import com.schoolapp.core.network.dto.payroll.PayrollRunDto
import com.schoolapp.core.network.dto.payroll.PayslipDto
import com.schoolapp.core.network.model.ApiEnvelope
import kotlinx.serialization.json.JsonObject
import retrofit2.http.GET
import retrofit2.http.POST
import retrofit2.http.Path
import retrofit2.http.Query

/** Payroll runs and payslips (phase 4 contract section C). */
interface PayrollApi {
    /** 404 when no payslip exists for [month] (`YYYY-MM`). */
    @GET("payslips/me")
    suspend fun myPayslip(@Query("month") month: String): ApiEnvelope<PayslipDto>

    @GET("payroll/runs")
    suspend fun runs(@Query("branchId") branchId: String? = null, @Query("month") month: String? = null): ApiEnvelope<List<PayrollRunDto>>

    @GET("payroll/runs/{id}")
    suspend fun run(@Path("id") id: String): ApiEnvelope<PayrollRunDto>

    /** Raises the PAYROLL approval; decided from Approvals. */
    @POST("payroll/runs/{id}/approve")
    suspend fun requestApproval(@Path("id") id: String): ApiEnvelope<JsonObject>
}
