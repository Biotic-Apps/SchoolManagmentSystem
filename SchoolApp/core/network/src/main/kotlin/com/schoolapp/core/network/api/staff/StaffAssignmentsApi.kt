package com.schoolapp.core.network.api.staff

import com.schoolapp.core.network.dto.staff.StaffAssignmentDto
import com.schoolapp.core.network.dto.staff.StaffDetailDto
import com.schoolapp.core.network.dto.staff.assignments.NewAssignmentRequest
import com.schoolapp.core.network.dto.staff.assignments.ProbationRequest
import com.schoolapp.core.network.model.ApiEnvelope
import retrofit2.http.Body
import retrofit2.http.DELETE
import retrofit2.http.GET
import retrofit2.http.POST
import retrofit2.http.PUT
import retrofit2.http.Path
import retrofit2.http.Query

/** Probation review and per-session assignments of one staff member (`staff.edit` for writes). */
interface StaffAssignmentsApi {
    @PUT("staff/{id}/probation")
    suspend fun setProbation(@Path("id") id: String, @Body body: ProbationRequest): ApiEnvelope<StaffDetailDto>

    @GET("staff/{id}/assignments")
    suspend fun assignments(@Path("id") id: String, @Query("sessionId") sessionId: String?): ApiEnvelope<List<StaffAssignmentDto>>

    @POST("staff/{id}/assignments")
    suspend fun add(@Path("id") id: String, @Body body: NewAssignmentRequest): ApiEnvelope<StaffAssignmentDto>

    @DELETE("staff/{id}/assignments/{assignmentId}")
    suspend fun end(@Path("id") id: String, @Path("assignmentId") assignmentId: String): ApiEnvelope<StaffAssignmentDto>
}
