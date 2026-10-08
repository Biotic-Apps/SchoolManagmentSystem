package com.schoolapp.core.network.dto.exams

import com.schoolapp.core.network.dto.common.IdNameDto
import kotlinx.serialization.Serializable

/**
 * `GET /exams` row. The API sends only `termId`; the term name is resolved from `sessions/:id/terms`.
 * `term` / `termName` are kept so an embedded term is still read if the API adds one.
 */
@Serializable
data class ExamDto(
    val id: String,
    val name: String = "",
    val type: String? = null,
    val status: String? = null,
    val branchId: String? = null,
    val sessionId: String? = null,
    val termId: String? = null,
    val computedAt: String? = null,
    val publishedAt: String? = null,
    val term: IdNameDto? = null,
    val termName: String? = null,
)

/** `GET /sessions/:id/terms` row. */
@Serializable
data class ExamTermDto(
    val id: String,
    val sessionId: String? = null,
    val name: String = "",
    val startDate: String? = null,
    val endDate: String? = null,
)
