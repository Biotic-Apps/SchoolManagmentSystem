package com.schoolapp.core.data.attendance

import com.schoolapp.core.model.attendance.QrPersonType
import com.schoolapp.core.model.attendance.QrScanLog
import com.schoolapp.core.model.attendance.QrScanOutcome
import com.schoolapp.core.model.attendance.QrScanResult
import com.schoolapp.core.model.common.enumOrDefault
import com.schoolapp.core.model.common.enumOrNull
import com.schoolapp.core.network.dto.attendance.QrScanLogDto
import com.schoolapp.core.network.dto.attendance.QrScanResultDto

internal fun QrScanResultDto.toModel() = QrScanResult(
    outcome = enumOrDefault(result, QrScanOutcome.NOT_FOUND),
    personType = enumOrNull<QrPersonType>(resolvedType),
    name = name,
    photoUrl = photoUrl,
    classLabel = classLabel,
    designation = designation,
    admissionNo = admissionNo,
    employeeNo = employeeNo,
    timestamp = timestamp,
)

internal fun QrScanLogDto.toModel() = QrScanLog(
    id = id,
    personType = enumOrNull<QrPersonType>(resolvedType),
    name = resolvedName,
    outcome = enumOrDefault(result, QrScanOutcome.NOT_FOUND),
    scannedAt = scannedAt,
)
