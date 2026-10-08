package com.schoolapp.core.network.api

import com.schoolapp.core.network.dto.admissions.ApplicationDto
import com.schoolapp.core.network.dto.people.ApplicationRequest
import com.schoolapp.core.network.dto.people.ChangeSectionRequest
import com.schoolapp.core.network.dto.people.GuardianDto
import com.schoolapp.core.network.dto.people.LinkGuardianRequest
import com.schoolapp.core.network.dto.people.RegisterStudentRequest
import com.schoolapp.core.network.dto.people.StudentDetailDto
import com.schoolapp.core.network.dto.people.TransferRequest
import com.schoolapp.core.network.dto.people.UpdateGuardianRequest
import com.schoolapp.core.network.dto.people.UpdateStudentRequest
import com.schoolapp.core.network.dto.people.WithdrawRequest
import com.schoolapp.core.network.model.ApiEnvelope
import kotlinx.serialization.json.JsonElement
import retrofit2.http.Body
import retrofit2.http.PATCH
import retrofit2.http.POST
import retrofit2.http.Path

/** Student registration and placement changes, guardian links and admission applications — the web's endpoints. */
interface StudentAdminApi {
    /** `students.add`; registers into a section of the active session. */
    @POST("students")
    suspend fun register(@Body body: RegisterStudentRequest): ApiEnvelope<StudentDetailDto>

    @PATCH("students/{id}")
    suspend fun update(@Path("id") id: String, @Body body: UpdateStudentRequest): ApiEnvelope<StudentDetailDto>

    @POST("students/{id}/withdraw")
    suspend fun withdraw(@Path("id") id: String, @Body body: WithdrawRequest): ApiEnvelope<JsonElement>

    @POST("students/{id}/change-section")
    suspend fun changeSection(@Path("id") id: String, @Body body: ChangeSectionRequest): ApiEnvelope<JsonElement>

    /** Request a transfer to another branch of the school; that branch places the student. */
    @POST("students/{id}/transfers")
    suspend fun transfer(@Path("id") id: String, @Body body: TransferRequest): ApiEnvelope<JsonElement>

    @POST("students/{id}/guardians")
    suspend fun linkGuardian(@Path("id") id: String, @Body body: LinkGuardianRequest): ApiEnvelope<JsonElement>

    /** `guardians.edit`. */
    @PATCH("guardians/{id}")
    suspend fun updateGuardian(@Path("id") id: String, @Body body: UpdateGuardianRequest): ApiEnvelope<GuardianDto>

    /** `admissions.add`. */
    @POST("admissions/applications")
    suspend fun createApplication(@Body body: ApplicationRequest): ApiEnvelope<ApplicationDto>
}
