package com.schoolapp.core.network.dto.staff.idcard

import kotlinx.serialization.Serializable

/** `GET /staff/:id/id-card`: latest card version (`404 NOT_FOUND` before the first one). */
@Serializable
data class StaffIdCardDto(
    val status: String,
    val fileUrl: String? = null,
    val version: Int = 0,
    val generatedAt: String? = null,
)

/** `POST /staff/:id/id-card`: id of the card version now rendering. */
@Serializable
data class StaffIdCardJobDto(val jobId: String)
