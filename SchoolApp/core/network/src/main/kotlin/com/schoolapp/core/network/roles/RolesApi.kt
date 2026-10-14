package com.schoolapp.core.network.roles

import com.schoolapp.core.network.api.Paging
import com.schoolapp.core.network.model.ApiEnvelope
import retrofit2.http.Body
import retrofit2.http.DELETE
import retrofit2.http.GET
import retrofit2.http.PATCH
import retrofit2.http.POST
import retrofit2.http.Path
import retrofit2.http.Query

/** Roles & Permissions (API RolesController). */
interface RolesApi {
    @GET("permissions")
    suspend fun permissions(): ApiEnvelope<List<PermissionDto>>

    @GET("roles")
    suspend fun roles(): ApiEnvelope<List<RoleDto>>

    @POST("roles")
    suspend fun create(@Body body: RoleBodyDto): ApiEnvelope<RoleDto>

    @PATCH("roles/{id}")
    suspend fun update(@Path("id") id: String, @Body body: RoleBodyDto): ApiEnvelope<RoleDto>

    @DELETE("roles/{id}")
    suspend fun delete(@Path("id") id: String)

    /** Active schools for the "limit to one school" picker (needs `schools.view`). */
    @GET("schools")
    suspend fun schools(
        @Query("status") status: String = "ACTIVE",
        @Query("pageSize") pageSize: Int = Paging.MAX_PAGE_SIZE,
    ): ApiEnvelope<List<SchoolOptionDto>>
}
