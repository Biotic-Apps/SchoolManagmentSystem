package com.schoolapp.core.data.attendance

import com.schoolapp.core.common.result.AppResult
import com.schoolapp.core.model.attendance.QrScanDirection
import com.schoolapp.core.model.attendance.QrScanLog
import com.schoolapp.core.model.attendance.QrScanResult

interface QrScanRepository {
    suspend fun scan(publicId: String, direction: QrScanDirection): AppResult<QrScanResult>
    suspend fun logs(): AppResult<List<QrScanLog>>
}
