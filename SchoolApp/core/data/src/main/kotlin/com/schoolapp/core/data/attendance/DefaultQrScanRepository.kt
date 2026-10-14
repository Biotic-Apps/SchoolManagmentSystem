package com.schoolapp.core.data.attendance

import com.schoolapp.core.common.result.AppResult
import com.schoolapp.core.model.attendance.QrScanDirection
import com.schoolapp.core.model.attendance.QrScanLog
import com.schoolapp.core.model.attendance.QrScanResult
import com.schoolapp.core.network.ApiCaller
import com.schoolapp.core.network.api.QrScanApi
import com.schoolapp.core.network.dto.attendance.QrScanBodyDto
import javax.inject.Inject
import javax.inject.Singleton

@Singleton
class DefaultQrScanRepository @Inject constructor(
    private val api: QrScanApi,
    private val apiCaller: ApiCaller,
) : QrScanRepository {

    override suspend fun scan(publicId: String, direction: QrScanDirection): AppResult<QrScanResult> =
        apiCaller.call { api.scan(QrScanBodyDto(publicId, direction.name)).data.toModel() }

    override suspend fun logs(): AppResult<List<QrScanLog>> =
        apiCaller.call { api.logs().data.map { it.toModel() } }
}
