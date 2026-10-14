package com.schoolapp.core.network.api.fees

import kotlinx.serialization.json.JsonObject
import okhttp3.ResponseBody
import retrofit2.http.Body
import retrofit2.http.GET
import retrofit2.http.POST
import retrofit2.http.Streaming
import retrofit2.http.Url

/** Endpoints that stream a PDF body (payslips of a run, family challan); [path] is relative to the API base url. */
interface PdfStreamApi {
    @Streaming
    @GET
    suspend fun get(@Url path: String): ResponseBody

    @Streaming
    @POST
    suspend fun post(@Url path: String, @Body body: JsonObject): ResponseBody
}
