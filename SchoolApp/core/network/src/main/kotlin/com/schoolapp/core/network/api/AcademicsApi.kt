package com.schoolapp.core.network.api

import com.schoolapp.core.network.dto.academics.ClassSubjectDto
import com.schoolapp.core.network.dto.academics.ClassSubjectItemRequest
import com.schoolapp.core.network.dto.academics.SetClassSubjectsRequest
import com.schoolapp.core.network.dto.academics.CreateClassRequest
import com.schoolapp.core.network.dto.academics.CreateRoomRequest
import com.schoolapp.core.network.dto.academics.CreateSectionRequest
import com.schoolapp.core.network.dto.academics.CreateSubjectRequest
import com.schoolapp.core.network.dto.academics.RenameRequest
import com.schoolapp.core.network.dto.academics.ReorderClassesRequest
import com.schoolapp.core.network.dto.academics.RoomDto
import com.schoolapp.core.network.dto.academics.TeachingStaffDto
import com.schoolapp.core.network.dto.allocation.ClassSetupDto
import com.schoolapp.core.network.dto.organisation.SchoolClassDto
import com.schoolapp.core.network.dto.organisation.SectionDto
import com.schoolapp.core.network.dto.organisation.SubjectDto
import com.schoolapp.core.network.model.ApiEnvelope
import kotlinx.serialization.json.JsonObject
import retrofit2.Response
import retrofit2.http.Body
import retrofit2.http.GET
import retrofit2.http.PATCH
import retrofit2.http.POST
import retrofit2.http.PUT
import retrofit2.http.Path
import retrofit2.http.Query

/** Classes, sections, curriculum, subjects, rooms and teacher allocation — the same endpoints the web uses. */
interface AcademicsApi {
    @POST("classes")
    suspend fun createClass(@Body body: CreateClassRequest): ApiEnvelope<SchoolClassDto>

    @PATCH("classes/{id}")
    suspend fun renameClass(@Path("id") id: String, @Body body: RenameRequest): ApiEnvelope<SchoolClassDto>

    /** 204: every active class of the school in the new order. */
    @PUT("classes/order")
    suspend fun reorderClasses(@Body body: ReorderClassesRequest): Response<Unit>

    @GET("classes/{id}/setup")
    suspend fun classSetup(
        @Path("id") classId: String,
        @Query("branchId") branchId: String,
        @Query("sessionId") sessionId: String? = null,
    ): ApiEnvelope<ClassSetupDto>

    /** 409 SUBJECT_IN_USE when a removed subject still has teachers or lessons. */
    @PUT("classes/{id}/subjects")
    suspend fun setClassSubjects(@Path("id") classId: String, @Body body: SetClassSubjectsRequest): ApiEnvelope<List<ClassSubjectDto>>

    @POST("sections")
    suspend fun createSection(@Body body: CreateSectionRequest): ApiEnvelope<SectionDto>

    /** Body built with explicit nulls (roomId/group null clears them). */
    @PATCH("sections/{id}")
    suspend fun updateSection(@Path("id") id: String, @Body body: JsonObject): ApiEnvelope<SectionDto>

    /** 409 SECTION_IN_USE when students are enrolled. */
    @POST("sections/{id}/archive")
    suspend fun archiveSection(@Path("id") id: String): ApiEnvelope<SectionDto>

    /** `{ staffId: uuid | null }`. */
    @PUT("sections/{id}/class-teacher")
    suspend fun setClassTeacher(@Path("id") sectionId: String, @Body body: JsonObject): ApiEnvelope<JsonObject>

    @PUT("sections/{id}/subject-teachers/{subjectId}")
    suspend fun setSubjectTeacher(
        @Path("id") sectionId: String,
        @Path("subjectId") subjectId: String,
        @Body body: JsonObject,
    ): ApiEnvelope<JsonObject>

    @GET("branches/{id}/teaching-staff")
    suspend fun teachingStaff(@Path("id") branchId: String, @Query("sessionId") sessionId: String? = null): ApiEnvelope<List<TeachingStaffDto>>

    @GET("subjects")
    suspend fun subjects(@Query("schoolId") schoolId: String?, @Query("pageSize") pageSize: Int = Paging.MAX_PAGE_SIZE): ApiEnvelope<List<SubjectDto>>

    @POST("subjects")
    suspend fun createSubject(@Body body: CreateSubjectRequest): ApiEnvelope<SubjectDto>

    @PATCH("subjects/{id}")
    suspend fun renameSubject(@Path("id") id: String, @Body body: RenameRequest): ApiEnvelope<SubjectDto>

    @GET("rooms")
    suspend fun rooms(@Query("branchId") branchId: String, @Query("pageSize") pageSize: Int = Paging.MAX_PAGE_SIZE): ApiEnvelope<List<RoomDto>>

    /** 409 ROOM_NAME_TAKEN. */
    @POST("rooms")
    suspend fun createRoom(@Body body: CreateRoomRequest): ApiEnvelope<RoomDto>

    @PATCH("rooms/{id}")
    suspend fun updateRoom(@Path("id") id: String, @Body body: RenameRequest): ApiEnvelope<RoomDto>
}
