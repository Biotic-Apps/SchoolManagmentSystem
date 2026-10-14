package com.schoolapp.core.network.api.settings

import com.schoolapp.core.network.dto.settings.BackupDownloadDto
import com.schoolapp.core.network.dto.settings.BackupRunDto
import com.schoolapp.core.network.dto.settings.JobIdDto
import com.schoolapp.core.network.model.ApiEnvelope
import retrofit2.http.GET
import retrofit2.http.POST
import retrofit2.http.Path

/** Database backups (phase 5 contract §D): super admin only. */
interface BackupsApi {
    @GET("backups")
    suspend fun list(): ApiEnvelope<List<BackupRunDto>>

    @POST("backups")
    suspend fun run(): ApiEnvelope<JobIdDto>

    @POST("backups/{id}/verify")
    suspend fun verify(@Path("id") id: String): ApiEnvelope<JobIdDto>

    @GET("backups/{id}/download")
    suspend fun download(@Path("id") id: String): ApiEnvelope<BackupDownloadDto>
}
