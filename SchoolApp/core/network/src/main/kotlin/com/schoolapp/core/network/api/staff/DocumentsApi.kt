package com.schoolapp.core.network.api.staff

import com.schoolapp.core.network.dto.people.DocumentDto
import com.schoolapp.core.network.dto.staff.documents.CreateDocumentRequest
import com.schoolapp.core.network.dto.staff.documents.RejectDocumentRequest
import com.schoolapp.core.network.dto.staff.documents.VerifyDocumentRequest
import com.schoolapp.core.network.model.ApiEnvelope
import retrofit2.http.Body
import retrofit2.http.GET
import retrofit2.http.POST
import retrofit2.http.Path
import retrofit2.http.Query

/** `/documents` — records attached to a staff member, student, guardian or application. No delete endpoint exists. */
interface DocumentsApi {
    @GET("documents")
    suspend fun list(@Query("ownerType") ownerType: String, @Query("ownerId") ownerId: String): ApiEnvelope<List<DocumentDto>>

    @POST("documents")
    suspend fun create(@Body body: CreateDocumentRequest): ApiEnvelope<DocumentDto>

    @POST("documents/{id}/verify")
    suspend fun verify(@Path("id") id: String, @Body body: VerifyDocumentRequest): ApiEnvelope<DocumentDto>

    @POST("documents/{id}/reject")
    suspend fun reject(@Path("id") id: String, @Body body: RejectDocumentRequest): ApiEnvelope<DocumentDto>
}
