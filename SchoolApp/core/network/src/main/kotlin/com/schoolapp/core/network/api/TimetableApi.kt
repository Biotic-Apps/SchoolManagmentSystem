package com.schoolapp.core.network.api

import com.schoolapp.core.network.dto.timetable.TeacherSlotDto
import com.schoolapp.core.network.dto.timetable.TimetableDto
import com.schoolapp.core.network.model.ApiEnvelope
import retrofit2.http.GET
import retrofit2.http.Query

/** Read-only timetable endpoints (contract section 6). */
interface TimetableApi {
    @GET("timetables/me")
    suspend fun mine(
        @Query("weekOf") weekOf: String? = null,
        @Query("studentId") studentId: String? = null,
    ): ApiEnvelope<List<TeacherSlotDto>>

    @GET("timetables")
    suspend fun section(@Query("sectionId") sectionId: String): ApiEnvelope<TimetableDto>
}
