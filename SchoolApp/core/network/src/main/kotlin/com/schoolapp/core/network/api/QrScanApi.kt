package com.schoolapp.core.network.api

import com.schoolapp.core.network.dto.attendance.QrScanBodyDto
import com.schoolapp.core.network.dto.attendance.QrScanLogDto
import com.schoolapp.core.network.dto.attendance.QrScanResultDto
import com.schoolapp.core.network.model.ApiEnvelope
import retrofit2.http.Body
import retrofit2.http.GET
import retrofit2.http.POST

/** ID-card QR attendance: scan (`attendance.add`) and today's log (`attendance.view`). */
interface QrScanApi {
    @POST("attendance/qr-scan")
    suspend fun scan(@Body body: QrScanBodyDto): ApiEnvelope<QrScanResultDto>

    @GET("attendance/qr-scan/logs")
    suspend fun logs(): ApiEnvelope<List<QrScanLogDto>>
}
