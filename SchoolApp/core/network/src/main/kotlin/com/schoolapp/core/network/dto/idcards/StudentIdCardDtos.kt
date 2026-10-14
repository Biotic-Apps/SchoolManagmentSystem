package com.schoolapp.core.network.dto.idcards

import kotlinx.serialization.Serializable

/** `GET /students/:id/id-card`: latest card version (`404 NOT_FOUND` before the first one). */
@Serializable
data class StudentIdCardDto(
    val status: String? = null,
    val fileUrl: String? = null,
    val version: Int = 0,
    val generatedAt: String? = null,
)

/** `POST /students/:id/id-card`: id of the card version now rendering. */
@Serializable
data class StudentIdCardJobDto(val jobId: String? = null)

/** `POST /students/id-cards/print`: one section, or a branch (+ optional class). */
@Serializable
data class IdCardPrintBodyDto(val sectionId: String? = null, val branchId: String? = null, val classId: String? = null)

/** Poll `GET /jobs/:jobId`; [count] students are on the A4 sheets. */
@Serializable
data class IdCardPrintJobDto(val jobId: String, val count: Int = 0)
