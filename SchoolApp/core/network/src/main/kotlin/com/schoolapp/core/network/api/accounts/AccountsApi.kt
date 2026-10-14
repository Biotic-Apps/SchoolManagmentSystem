package com.schoolapp.core.network.api.accounts

import com.schoolapp.core.network.dto.accounts.CreateIncomeRequest
import com.schoolapp.core.network.dto.accounts.IncomeCategoryDto
import com.schoolapp.core.network.dto.accounts.IncomeCategoryRequest
import com.schoolapp.core.network.dto.accounts.IncomeDto
import com.schoolapp.core.network.dto.accounts.ProfitLossDto
import com.schoolapp.core.network.dto.accounts.UpdateIncomeRequest
import com.schoolapp.core.network.model.ApiEnvelope
import retrofit2.http.Body
import retrofit2.http.DELETE
import retrofit2.http.GET
import retrofit2.http.PATCH
import retrofit2.http.POST
import retrofit2.http.Path
import retrofit2.http.Query

/** Accounts: other income, income categories and branch profit & loss (`expenses.*` permissions). */
interface AccountsApi {
    @GET("income-categories")
    suspend fun incomeCategories(@Query("schoolId") schoolId: String?): ApiEnvelope<List<IncomeCategoryDto>>

    @POST("income-categories")
    suspend fun createIncomeCategory(
        @Query("schoolId") schoolId: String?,
        @Body body: IncomeCategoryRequest,
    ): ApiEnvelope<IncomeCategoryDto>

    @GET("income")
    suspend fun income(
        @Query("branchId") branchId: String,
        @Query("categoryId") categoryId: String?,
        @Query("from") from: String?,
        @Query("to") to: String?,
        @Query("page") page: Int,
        @Query("pageSize") pageSize: Int,
    ): ApiEnvelope<List<IncomeDto>>

    @POST("income")
    suspend fun createIncome(@Body body: CreateIncomeRequest): ApiEnvelope<IncomeDto>

    @PATCH("income/{id}")
    suspend fun updateIncome(@Path("id") id: String, @Body body: UpdateIncomeRequest): ApiEnvelope<IncomeDto>

    /** 204 No Content. */
    @DELETE("income/{id}")
    suspend fun deleteIncome(@Path("id") id: String)

    @GET("profit-loss")
    suspend fun profitLoss(
        @Query("branchId") branchId: String,
        @Query("from") from: String,
        @Query("to") to: String,
    ): ApiEnvelope<ProfitLossDto>
}
