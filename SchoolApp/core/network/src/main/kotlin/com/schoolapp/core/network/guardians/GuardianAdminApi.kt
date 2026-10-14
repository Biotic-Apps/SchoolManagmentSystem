package com.schoolapp.core.network.guardians

import com.schoolapp.core.network.dto.people.ChildLinkRequestDto
import com.schoolapp.core.network.dto.people.GuardianDto
import com.schoolapp.core.network.model.ApiEnvelope
import kotlinx.serialization.json.JsonElement
import retrofit2.http.Body
import retrofit2.http.GET
import retrofit2.http.HTTP
import retrofit2.http.POST
import retrofit2.http.Path
import retrofit2.http.Query

/** Parents & Guardians admin (web features/guardians): paged lists, detail, sign-in, unlink, login slips. */
interface GuardianAdminApi {
    @GET("guardians")
    suspend fun guardians(
        @Query("page") page: Int,
        @Query("search") search: String? = null,
        @Query("branchId") branchId: String? = null,
        @Query("pageSize") pageSize: Int = PAGE_SIZE,
    ): ApiEnvelope<List<GuardianDto>>

    @GET("guardians/{id}")
    suspend fun guardian(@Path("id") id: String): ApiEnvelope<GuardianDetailDto>

    @GET("child-links")
    suspend fun childLinks(
        @Query("page") page: Int,
        @Query("status") status: String? = "REQUESTED",
        @Query("branchId") branchId: String? = null,
        @Query("pageSize") pageSize: Int = PAGE_SIZE,
    ): ApiEnvelope<List<ChildLinkRequestDto>>

    @POST("child-links/{id}/approve")
    suspend fun approveChildLink(@Path("id") id: String, @Body body: ReasonBodyDto): ApiEnvelope<JsonElement>

    @POST("child-links/{id}/reject")
    suspend fun rejectChildLink(@Path("id") id: String, @Body body: ReasonBodyDto): ApiEnvelope<JsonElement>

    @POST("guardians/{id}/account")
    suspend fun createAccount(@Path("id") id: String): ApiEnvelope<GuardianAccountDto>

    @POST("guardians/{id}/account/reset-password")
    suspend fun resetPassword(@Path("id") id: String): ApiEnvelope<GuardianPasswordResetDto>

    @POST("guardians/{id}/account/send-sign-in")
    suspend fun sendSignIn(@Path("id") id: String): ApiEnvelope<GuardianSignInSentDto>

    @HTTP(method = "DELETE", path = "students/{studentId}/guardians/{linkId}", hasBody = true)
    suspend fun unlink(
        @Path("studentId") studentId: String,
        @Path("linkId") linkId: String,
        @Body body: ReasonBodyDto,
    ): ApiEnvelope<JsonElement>

    @POST("guardians/login-slips/preview")
    suspend fun previewLoginSlips(@Body body: LoginSlipBodyDto): ApiEnvelope<LoginSlipPreviewDto>

    @POST("guardians/login-slips/print")
    suspend fun printLoginSlips(@Body body: LoginSlipBodyDto): ApiEnvelope<LoginSlipJobDto>

    companion object {
        const val PAGE_SIZE = 30
    }
}
