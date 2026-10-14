package com.schoolapp.core.network.api

import com.schoolapp.core.network.dto.message.MessageRecipientDto
import com.schoolapp.core.network.dto.message.NewThreadBodyDto
import com.schoolapp.core.network.dto.message.SendMessageBodyDto
import com.schoolapp.core.network.dto.message.ThreadDetailDto
import com.schoolapp.core.network.dto.message.ThreadDto
import com.schoolapp.core.network.model.ApiEnvelope
import kotlinx.serialization.json.JsonObject
import retrofit2.http.Body
import retrofit2.http.GET
import retrofit2.http.POST
import retrofit2.http.Path
import retrofit2.http.Query

/** Parent-staff messaging (phase 3 contract section 7). */
interface MessagesApi {
    @GET("messages/threads")
    suspend fun threads(
        @Query("studentId") studentId: String? = null,
        @Query("unread") unread: String? = null,
        @Query("scope") scope: String? = null,
        @Query("page") page: Int? = null,
        @Query("pageSize") pageSize: Int? = null,
    ): ApiEnvelope<List<ThreadDto>>

    /** Staff a parent may write to about [studentId]: class teacher, subject teachers, principal. */
    @GET("messages/recipients")
    suspend fun recipients(@Query("studentId") studentId: String): ApiEnvelope<List<MessageRecipientDto>>

    @GET("messages/threads/{id}")
    suspend fun thread(@Path("id") id: String, @Query("before") before: String? = null): ApiEnvelope<ThreadDetailDto>

    /** Thread, or `{ thread, messages }`; read leniently. */
    @POST("messages/threads")
    suspend fun startThread(@Body body: NewThreadBodyDto): ApiEnvelope<JsonObject>

    /** Message (+ `deliveredSilently`), or `{ message, deliveredSilently }`; read leniently. */
    @POST("messages/threads/{id}/messages")
    suspend fun send(@Path("id") threadId: String, @Body body: SendMessageBodyDto): ApiEnvelope<JsonObject>

    @POST("messages/threads/{id}/read")
    suspend fun markRead(@Path("id") threadId: String)
}
