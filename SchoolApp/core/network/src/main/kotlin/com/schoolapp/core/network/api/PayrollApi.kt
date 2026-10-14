package com.schoolapp.core.network.api

import com.schoolapp.core.network.dto.payroll.CreatePayrollRunRequest
import com.schoolapp.core.network.dto.payroll.PayrollJobDto
import com.schoolapp.core.network.dto.payroll.PayrollPaymentRequest
import com.schoolapp.core.network.dto.payroll.PayrollRunDto
import com.schoolapp.core.network.dto.payroll.PayslipDto
import com.schoolapp.core.network.model.ApiEnvelope
import kotlinx.serialization.json.JsonObject
import retrofit2.http.Body
import retrofit2.http.GET
import retrofit2.http.POST
import retrofit2.http.Path
import retrofit2.http.Query

/** Payroll runs and payslips (phase 4 contract section C). */
interface PayrollApi {
    /** 404 when no payslip exists for [month] (`YYYY-MM`). */
    @GET("payslips/me")
    suspend fun myPayslip(@Query("month") month: String): ApiEnvelope<PayslipDto>

    /** A staff member's payslip (`payroll.view`); 404 when none for [month]. */
    @GET("payslips/{staffId}")
    suspend fun staffPayslip(@Path("staffId") staffId: String, @Query("month") month: String): ApiEnvelope<PayslipDto>

    @GET("payroll/runs")
    suspend fun runs(@Query("branchId") branchId: String? = null, @Query("month") month: String? = null): ApiEnvelope<List<PayrollRunDto>>

    @GET("payroll/runs/{id}")
    suspend fun run(@Path("id") id: String): ApiEnvelope<PayrollRunDto>

    /** 409 when the branch already has a run for the month. */
    @POST("payroll/runs")
    suspend fun createRun(@Body body: CreatePayrollRunRequest): ApiEnvelope<PayrollRunDto>

    /** Queues the calculation; poll `GET /jobs/:id` with the returned job id. */
    @POST("payroll/runs/{id}/calculate")
    suspend fun calculate(@Path("id") id: String): ApiEnvelope<PayrollJobDto>

    @POST("payroll/runs/{id}/review")
    suspend fun review(@Path("id") id: String): ApiEnvelope<JsonObject>

    /** Raises the PAYROLL approval; decided from Approvals. */
    @POST("payroll/runs/{id}/approve")
    suspend fun requestApproval(@Path("id") id: String): ApiEnvelope<JsonObject>

    @POST("payroll/runs/{id}/payments")
    suspend fun recordPayment(@Path("id") id: String, @Body body: PayrollPaymentRequest): ApiEnvelope<JsonObject>

    @POST("payroll/runs/{id}/close")
    suspend fun close(@Path("id") id: String): ApiEnvelope<JsonObject>
}
