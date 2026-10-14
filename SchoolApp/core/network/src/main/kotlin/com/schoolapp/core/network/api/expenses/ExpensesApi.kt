package com.schoolapp.core.network.api.expenses

import com.schoolapp.core.network.dto.expenses.CreateExpenseCategoryDto
import com.schoolapp.core.network.dto.expenses.CreateExpenseDto
import com.schoolapp.core.network.dto.expenses.CreateVendorDto
import com.schoolapp.core.network.dto.expenses.ExpenseCategoryDto
import com.schoolapp.core.network.dto.expenses.ExpenseDto
import com.schoolapp.core.network.dto.expenses.ExpensePaymentInputDto
import com.schoolapp.core.network.dto.expenses.UpdateExpenseDto
import com.schoolapp.core.network.dto.expenses.VendorDto
import com.schoolapp.core.network.model.ApiEnvelope
import retrofit2.http.Body
import retrofit2.http.GET
import retrofit2.http.PATCH
import retrofit2.http.POST
import retrofit2.http.Path
import retrofit2.http.Query

/** Expenses, vendors and expense categories (phase 4 contract section D). */
interface ExpensesApi {
    @GET("expenses")
    suspend fun expenses(
        @Query("branchId") branchId: String,
        @Query("categoryId") categoryId: String? = null,
        @Query("status") status: String? = null,
        @Query("from") from: String? = null,
        @Query("to") to: String? = null,
        @Query("page") page: Int = 1,
        @Query("pageSize") pageSize: Int = 20,
    ): ApiEnvelope<List<ExpenseDto>>

    @GET("expenses/{id}")
    suspend fun expense(@Path("id") id: String): ApiEnvelope<ExpenseDto>

    @POST("expenses")
    suspend fun create(@Body body: CreateExpenseDto): ApiEnvelope<ExpenseDto>

    /** Only DRAFT or REJECTED expenses; the result is a DRAFT again. */
    @PATCH("expenses/{id}")
    suspend fun update(@Path("id") id: String, @Body body: UpdateExpenseDto): ApiEnvelope<ExpenseDto>

    /** Raises the EXPENSE approval; decided from Approvals. */
    @POST("expenses/{id}/submit")
    suspend fun submit(@Path("id") id: String): ApiEnvelope<ExpenseDto>

    @POST("expenses/{id}/payments")
    suspend fun pay(@Path("id") id: String, @Body body: ExpensePaymentInputDto): ApiEnvelope<ExpenseDto>

    @GET("vendors")
    suspend fun vendors(
        @Query("schoolId") schoolId: String? = null,
        @Query("search") search: String? = null,
        @Query("page") page: Int = 1,
        @Query("pageSize") pageSize: Int = 20,
    ): ApiEnvelope<List<VendorDto>>

    @POST("vendors")
    suspend fun createVendor(@Body body: CreateVendorDto): ApiEnvelope<VendorDto>

    @GET("expense-categories")
    suspend fun categories(@Query("schoolId") schoolId: String? = null): ApiEnvelope<List<ExpenseCategoryDto>>

    @POST("expense-categories")
    suspend fun createCategory(@Body body: CreateExpenseCategoryDto): ApiEnvelope<ExpenseCategoryDto>
}
