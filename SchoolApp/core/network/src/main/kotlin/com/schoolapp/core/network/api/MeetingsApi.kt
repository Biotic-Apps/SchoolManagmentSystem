package com.schoolapp.core.network.api

import com.schoolapp.core.network.dto.common.ReasonBodyDto
import com.schoolapp.core.network.dto.meeting.AcceptMeetingBodyDto
import com.schoolapp.core.network.dto.meeting.BookMeetingBodyDto
import com.schoolapp.core.network.dto.meeting.CompleteMeetingBodyDto
import com.schoolapp.core.network.dto.meeting.CreateSlotsBodyDto
import com.schoolapp.core.network.dto.meeting.FollowUpDto
import com.schoolapp.core.network.dto.meeting.MeetingDto
import com.schoolapp.core.network.dto.meeting.MeetingRequestBodyDto
import com.schoolapp.core.network.dto.meeting.MeetingSlotDto
import com.schoolapp.core.network.dto.meeting.MeetingTeacherDto
import com.schoolapp.core.network.dto.meeting.StaffMeetingBodyDto
import com.schoolapp.core.network.model.ApiEnvelope
import retrofit2.http.Body
import retrofit2.http.DELETE
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

    /** Staff publish one or more slots (server rejects overlaps and past dates). */
    @POST("meetings/slots")
    suspend fun createSlots(@Body body: CreateSlotsBodyDto): ApiEnvelope<List<MeetingSlotDto>>

    /** Only the owner's OPEN slots; 409 once booked. */
    @DELETE("meetings/slots/{id}")
    suspend fun deleteSlot(@Path("id") id: String): ApiEnvelope<MeetingSlotDto>

    /** The child's class/subject teachers and principal, with open slot counts. */
    @GET("meetings/teachers")
    suspend fun teachers(@Query("studentId") studentId: String): ApiEnvelope<List<MeetingTeacherDto>>

    /** Parent suggests a time (status REQUESTED); 409 while one is already waiting for that teacher. */
    @POST("meetings/requests")
    suspend fun request(@Body body: MeetingRequestBodyDto): ApiEnvelope<MeetingDto>

    /** Staff confirm a REQUESTED meeting (409 once answered or withdrawn). */
    @POST("meetings/{id}/accept")
    suspend fun accept(@Path("id") id: String, @Body body: AcceptMeetingBodyDto): ApiEnvelope<MeetingDto>

    @POST("meetings/{id}/decline")
    suspend fun decline(@Path("id") id: String, @Body body: ReasonBodyDto): ApiEnvelope<MeetingDto>

    @POST("meetings")
    suspend fun book(@Body body: BookMeetingBodyDto): ApiEnvelope<MeetingDto>

    /** Staff-initiated meeting with a guardian (no slot). */
    @POST("meetings")
    suspend fun schedule(@Body body: StaffMeetingBodyDto): ApiEnvelope<MeetingDto>

    @GET("meetings")
    suspend fun meetings(
        @Query("box") box: String,
        @Query("studentId") studentId: String? = null,
        @Query("page") page: Int? = null,
        @Query("pageSize") pageSize: Int? = null,
    ): ApiEnvelope<List<MeetingDto>>

    @GET("meetings/{id}")
    suspend fun meeting(@Path("id") id: String): ApiEnvelope<MeetingDto>

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
