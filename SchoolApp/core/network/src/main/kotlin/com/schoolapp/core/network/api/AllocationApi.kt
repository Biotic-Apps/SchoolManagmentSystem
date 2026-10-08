package com.schoolapp.core.network.api

import com.schoolapp.core.network.dto.allocation.AllocationRowDto
import com.schoolapp.core.network.dto.allocation.ClassSetupDto
import com.schoolapp.core.network.dto.allocation.SetTeacherRequest
import com.schoolapp.core.network.model.ApiEnvelope
import retrofit2.http.Body
import retrofit2.http.GET
import retrofit2.http.PUT
import retrofit2.http.Path
import retrofit2.http.Query

/** Class teacher and subject teacher allocation (academics-timetable contract §5.2–5.3). */
interface AllocationApi {
    @GET("classes/{id}/setup")
    suspend fun classSetup(@Path("id") classId: String, @Query("branchId") branchId: String): ApiEnvelope<ClassSetupDto>

    @PUT("sections/{id}/class-teacher")
    suspend fun setClassTeacher(@Path("id") sectionId: String, @Body body: SetTeacherRequest): ApiEnvelope<AllocationRowDto>

    @PUT("sections/{id}/subject-teachers/{subjectId}")
    suspend fun setSubjectTeacher(
        @Path("id") sectionId: String,
        @Path("subjectId") subjectId: String,
        @Body body: SetTeacherRequest,
    ): ApiEnvelope<AllocationRowDto>
}
