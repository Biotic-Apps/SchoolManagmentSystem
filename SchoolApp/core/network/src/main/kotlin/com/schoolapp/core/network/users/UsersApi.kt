package com.schoolapp.core.network.users

import com.schoolapp.core.network.model.ApiEnvelope
import kotlinx.serialization.json.JsonObject
import retrofit2.http.Body
import retrofit2.http.DELETE
import retrofit2.http.GET
import retrofit2.http.PATCH
import retrofit2.http.POST
import retrofit2.http.Path
import retrofit2.http.Query

/** Principals & admin users (API UsersController). */
interface UsersApi {
    @GET("users")
    suspend fun users(
        @Query("search") search: String? = null,
        @Query("role") role: String? = null,
        @Query("branchId") branchId: String? = null,
        @Query("status") status: String? = null,
        @Query("page") page: Int = 1,
        @Query("pageSize") pageSize: Int = 25,
    ): ApiEnvelope<List<UserSummaryDto>>

    @GET("users/{id}")
    suspend fun user(@Path("id") id: String): ApiEnvelope<UserDetailDto>

    @POST("users")
    suspend fun create(@Body body: CreateUserBody): ApiEnvelope<UserDetailDto>

    /** `email` / `phone` sent as JSON null clear the field. */
    @PATCH("users/{id}")
    suspend fun update(@Path("id") id: String, @Body body: JsonObject): ApiEnvelope<UserDetailDto>

    @POST("users/{id}/disable")
    suspend fun disable(@Path("id") id: String): ApiEnvelope<UserDetailDto>

    @POST("users/{id}/enable")
    suspend fun enable(@Path("id") id: String): ApiEnvelope<UserDetailDto>

    @POST("users/{id}/unlock")
    suspend fun unlock(@Path("id") id: String): ApiEnvelope<UserDetailDto>

    @POST("users/{id}/reset-password")
    suspend fun resetPassword(@Path("id") id: String): ApiEnvelope<TemporaryPasswordDto>

    @POST("users/{id}/assignments")
    suspend fun addAssignment(@Path("id") id: String, @Body body: AssignmentBody): ApiEnvelope<UserDetailDto>

    @DELETE("users/{id}/assignments/{assignmentId}")
    suspend fun endAssignment(@Path("id") id: String, @Path("assignmentId") assignmentId: String): ApiEnvelope<UserDetailDto>

    /** Roles for the assignment picker; only custom (non-system) rows are used. */
    @GET("roles")
    suspend fun roles(): ApiEnvelope<List<AssignableRoleDto>>
}
