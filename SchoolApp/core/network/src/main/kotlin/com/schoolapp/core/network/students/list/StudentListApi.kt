package com.schoolapp.core.network.students.list

import com.schoolapp.core.network.dto.people.StudentSummaryDto
import com.schoolapp.core.network.model.ApiEnvelope
import retrofit2.http.GET
import retrofit2.http.Query

/** Paged, filtered `GET /students` (web use-students-tab): branch session, class, section, status, search. */
interface StudentListApi {
    @GET("students")
    suspend fun students(
        @Query("page") page: Int,
        @Query("branchId") branchId: String? = null,
        @Query("sessionId") sessionId: String? = null,
        @Query("classId") classId: String? = null,
        @Query("sectionId") sectionId: String? = null,
        @Query("status") status: String? = null,
        @Query("search") search: String? = null,
        @Query("pageSize") pageSize: Int = PAGE_SIZE,
    ): ApiEnvelope<List<StudentSummaryDto>>

    companion object {
        const val PAGE_SIZE = 30
    }
}
