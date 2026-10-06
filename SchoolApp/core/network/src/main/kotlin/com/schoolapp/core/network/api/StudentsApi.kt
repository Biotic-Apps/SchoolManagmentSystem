package com.schoolapp.core.network.api

import com.schoolapp.core.network.dto.people.EnrollmentDto
import com.schoolapp.core.network.dto.people.StudentDetailDto
import com.schoolapp.core.network.dto.people.StudentSummaryDto
import com.schoolapp.core.network.model.ApiEnvelope
import retrofit2.http.GET
import retrofit2.http.Path
import retrofit2.http.Query

/** Read-only student endpoints (docs/api/phase2-contract.md section 2); results are scope-filtered server-side. */
interface StudentsApi {
    @GET("students")
    suspend fun students(
        @Query("branchId") branchId: String? = null,
        @Query("sectionId") sectionId: String? = null,
        @Query("search") search: String? = null,
        @Query("status") status: String? = null,
        @Query("pageSize") pageSize: Int = Paging.MAX_PAGE_SIZE,
    ): ApiEnvelope<List<StudentSummaryDto>>

    @GET("students/{id}")
    suspend fun student(@Path("id") id: String): ApiEnvelope<StudentDetailDto>

    @GET("students/{id}/enrollments")
    suspend fun enrollments(@Path("id") id: String): ApiEnvelope<List<EnrollmentDto>>
}
