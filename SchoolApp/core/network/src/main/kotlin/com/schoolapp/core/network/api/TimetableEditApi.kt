package com.schoolapp.core.network.api

import com.schoolapp.core.network.dto.timetable.BellScheduleDto
import com.schoolapp.core.network.dto.timetable.BellScheduleRequest
import com.schoolapp.core.network.dto.timetable.CellResultDto
import com.schoolapp.core.network.dto.timetable.LessonRequest
import com.schoolapp.core.network.dto.timetable.TimetableBuilderDto
import com.schoolapp.core.network.model.ApiEnvelope
import kotlinx.serialization.json.JsonObject
import retrofit2.http.Body
import retrofit2.http.DELETE
import retrofit2.http.GET
import retrofit2.http.POST
import retrofit2.http.PUT
import retrofit2.http.Path

/** Timetable builder (autosaved cells, publish, discard) and bell schedule editing; contract §5.4–5.5. */
interface TimetableEditApi {
    @GET("timetables/{sectionId}/builder")
    suspend fun builder(@Path("sectionId") sectionId: String): ApiEnvelope<TimetableBuilderDto>

    @PUT("timetables/{sectionId}/slots/{day}/{periodIndex}")
    suspend fun saveLesson(
        @Path("sectionId") sectionId: String,
        @Path("day") day: Int,
        @Path("periodIndex") periodIndex: Int,
        @Body body: LessonRequest,
    ): ApiEnvelope<CellResultDto>

    @DELETE("timetables/{sectionId}/slots/{day}/{periodIndex}")
    suspend fun removeLesson(
        @Path("sectionId") sectionId: String,
        @Path("day") day: Int,
        @Path("periodIndex") periodIndex: Int,
    ): ApiEnvelope<CellResultDto>

    /** 409 NOTHING_TO_PUBLISH / TIMETABLE_CONFLICTS. */
    @POST("timetables/{sectionId}/publish")
    suspend fun publish(@Path("sectionId") sectionId: String): ApiEnvelope<JsonObject>

    /** 409 NOTHING_TO_DISCARD. */
    @POST("timetables/{sectionId}/discard")
    suspend fun discard(@Path("sectionId") sectionId: String): ApiEnvelope<JsonObject>

    /** 409 PERIODS_IN_USE (details = affected lessons) unless `dropLessons: true`. */
    @PUT("branches/{id}/bell-schedule")
    suspend fun saveBellSchedule(@Path("id") branchId: String, @Body body: BellScheduleRequest): ApiEnvelope<BellScheduleDto>
}
