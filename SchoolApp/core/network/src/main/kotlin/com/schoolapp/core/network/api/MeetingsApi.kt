package com.schoolapp.core.network.api

import com.schoolapp.core.network.dto.common.ReasonBodyDto
import com.schoolapp.core.network.dto.meeting.BookMeetingBodyDto
import com.schoolapp.core.network.dto.meeting.CompleteMeetingBodyDto
import com.schoolapp.core.network.dto.meeting.FollowUpDto
import com.schoolapp.core.network.dto.meeting.MeetingDto
import com.schoolapp.core.network.dto.meeting.MeetingSlotDto
import com.schoolapp.core.network.model.ApiEnvelope
import retrofit2.http.Body
import retrofit2.http.GET
import retrofit2.http.POST
import retrofit2.http.Path
import retrofit2.http.Query

/** Meeting slots, bookings and follow-ups (phase 3 contract section 9). */
interface MeetingsApi {
    @GET("meetings/slots")
    suspend fun slots(
        @Query("staffUserId") staffUserId: String? = null,
        @Query("from") from: String? = null,
        @Query("to") to: String? = null,
    ): ApiEnvelope<List<MeetingSlotDto>>

    @POST("meetings")
    suspend fun book(@Body body: BookMeetingBodyDto): ApiEnvelope<MeetingDto>

    @GET("meetings")
    suspend fun meetings(@Query("box") box: String, @Query("studentId") studentId: String? = null): ApiEnvelope<List<MeetingDto>>

    @POST("meetings/{id}/cancel")
    suspend fun cancel(@Path("id") id: String, @Body body: ReasonBodyDto): ApiEnvelope<MeetingDto>

    @POST("meetings/{id}/complete")
    suspend fun complete(@Path("id") id: String, @Body body: CompleteMeetingBodyDto): ApiEnvelope<MeetingDto>

    @POST("meetings/{id}/no-show")
    suspend fun noShow(@Path("id") id: String, @Body body: ReasonBodyDto): ApiEnvelope<MeetingDto>

    @GET("follow-ups")
    suspend fun followUps(@Query("mine") mine: Boolean = true, @Query("status") status: String? = "OPEN"): ApiEnvelope<List<FollowUpDto>>

    @POST("follow-ups/{id}/done")
    suspend fun markFollowUpDone(@Path("id") id: String)
}
