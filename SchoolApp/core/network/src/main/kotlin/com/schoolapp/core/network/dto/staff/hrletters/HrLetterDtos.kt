package com.schoolapp.core.network.dto.staff.hrletters

import kotlinx.serialization.Serializable

/** `GET /hr-letter-templates` row. */
@Serializable
data class HrLetterTemplateDto(
    val id: String,
    val type: String,
    val title: String,
    val status: String = "ACTIVE",
)

/** `GET /staff/:staffId/hr-letters` row and `POST` response. */
@Serializable
data class HrLetterDto(
    val id: String,
    val staffId: String,
    val templateId: String,
    val type: String,
    val subject: String,
    val fileUrl: String? = null,
    val issuedAt: String,
    val createdAt: String? = null,
)

/** `POST /staff/:staffId/hr-letters` body; null fields are omitted (server defaults them). */
@Serializable
data class GenerateHrLetterRequest(
    val templateId: String,
    val subject: String? = null,
    val effectiveDate: String? = null,
)

/** `GET /hr-letters/:id/download`: freshly signed PDF link. */
@Serializable
data class HrLetterDownloadDto(val fileUrl: String)
