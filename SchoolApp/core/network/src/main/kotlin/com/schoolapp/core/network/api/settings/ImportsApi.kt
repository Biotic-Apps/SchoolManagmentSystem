package com.schoolapp.core.network.api.settings

import com.schoolapp.core.network.dto.settings.CommitImportBodyDto
import com.schoolapp.core.network.dto.settings.ImportCreatedDto
import com.schoolapp.core.network.model.ApiEnvelope
import kotlinx.serialization.json.JsonElement
import kotlinx.serialization.json.JsonObject
import okhttp3.MultipartBody
import okhttp3.RequestBody
import okhttp3.ResponseBody
import retrofit2.http.Body
import retrofit2.http.GET
import retrofit2.http.Multipart
import retrofit2.http.POST
import retrofit2.http.Part
import retrofit2.http.Path
import retrofit2.http.Query
import retrofit2.http.Streaming

/** Bulk data import (Settings › Data import): upload → validate → commit / revert. */
interface ImportsApi {
    @Streaming
    @GET("imports/templates/{kind}")
    suspend fun template(@Path("kind") kind: String): ResponseBody

    @Multipart
    @POST("imports")
    suspend fun upload(
        @Part file: MultipartBody.Part,
        @Part("kind") kind: RequestBody,
        @Part("branchId") branchId: RequestBody,
        @Part("sessionId") sessionId: RequestBody,
    ): ApiEnvelope<ImportCreatedDto>

    /** History rows; parsed leniently (plain array or a page object). */
    @GET("imports")
    suspend fun history(@Query("branchId") branchId: String): ApiEnvelope<JsonElement>

    @GET("imports/{id}")
    suspend fun detail(@Path("id") id: String): ApiEnvelope<JsonObject>

    @POST("imports/{id}/commit")
    suspend fun commit(@Path("id") id: String, @Body body: CommitImportBodyDto)

    @POST("imports/{id}/revert")
    suspend fun revert(@Path("id") id: String)
}
