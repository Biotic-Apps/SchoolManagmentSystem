package com.schoolapp.core.network.api

import com.schoolapp.core.network.dto.timetable.BellScheduleDto
import com.schoolapp.core.network.dto.timetable.PeriodDto
import com.schoolapp.core.network.dto.timetable.TeacherSlotDto
import com.schoolapp.core.network.dto.timetable.TimetableDto
import com.schoolapp.core.network.model.ApiEnvelope
import retrofit2.http.GET
import retrofit2.http.Path
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

    /** Default rows plus weekday variants; allowed for every role with `timetable.view`. */
    @GET("branches/{id}/bell-schedule")
    suspend fun bellSchedule(@Path("id") branchId: String): ApiEnvelope<BellScheduleDto>

    /** Older servers: default rows only. */
    @GET("branches/{id}/periods")
    suspend fun periods(@Path("id") branchId: String): ApiEnvelope<List<PeriodDto>>
}
