package com.schoolapp.core.network.dto.attendance

import kotlinx.serialization.Serializable

@Serializable
data class QrScanBodyDto(val publicId: String, val type: String)

@Serializable
data class QrScanResultDto(
    val result: String,
    val resolvedType: String? = null,
    val name: String? = null,
    val photoUrl: String? = null,
    val classLabel: String? = null,
    val designation: String? = null,
    val admissionNo: String? = null,
    val employeeNo: String? = null,
    val timestamp: String = "",
)

@Serializable
data class QrScanLogDto(
    val id: String,
    val publicId: String? = null,
    val resolvedType: String? = null,
    val resolvedName: String? = null,
    val result: String = "",
    val scannedAt: String = "",
)
