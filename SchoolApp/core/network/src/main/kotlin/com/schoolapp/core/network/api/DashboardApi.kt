package com.schoolapp.core.network.api

import com.schoolapp.core.network.dto.dashboard.ChildTodayDto
import com.schoolapp.core.network.dto.dashboard.TeacherTodayDto
import com.schoolapp.core.network.model.ApiEnvelope
import kotlinx.serialization.json.JsonObject
import retrofit2.http.GET
import retrofit2.http.Query

interface DashboardApi {
    /** Counts keyed by module; new keys appear as later phases ship, so the body stays a JsonObject. */
    @GET("dashboard/summary")
    suspend fun summary(
        @Query("schoolId") schoolId: String? = null,
        @Query("branchId") branchId: String? = null,
        @Query("sessionId") sessionId: String? = null,
    ): ApiEnvelope<JsonObject>

    /** Principal/coordinator queue counts, keyed like the summary. */
    @GET("dashboard/pending")
    suspend fun pending(@Query("branchId") branchId: String? = null, @Query("date") date: String? = null): ApiEnvelope<JsonObject>

    @GET("dashboard/teacher-today")
    suspend fun teacherToday(): ApiEnvelope<TeacherTodayDto>

    @GET("dashboard/child-today")
    suspend fun childToday(@Query("studentId") studentId: String): ApiEnvelope<ChildTodayDto>
}
