package com.schoolapp.core.network.api

import com.schoolapp.core.network.dto.files.UploadedFileDto
import com.schoolapp.core.network.model.ApiEnvelope
import okhttp3.MultipartBody
import okhttp3.RequestBody
import retrofit2.http.Multipart
import retrofit2.http.POST
import retrofit2.http.Part

/** `POST /files` multipart upload (`file` + `purpose`). */
interface FilesApi {
    @Multipart
    @POST("files")
    suspend fun upload(@Part file: MultipartBody.Part, @Part("purpose") purpose: RequestBody): ApiEnvelope<UploadedFileDto>
}
