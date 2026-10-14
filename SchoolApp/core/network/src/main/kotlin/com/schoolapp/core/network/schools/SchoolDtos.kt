package com.schoolapp.core.network.schools

import kotlinx.serialization.Serializable

/** API SchoolDto. */
@Serializable
data class SchoolDto(
    val id: String,
    val code: String = "",
    val name: String = "",
    val address: String? = null,
    val phone: String? = null,
    val email: String? = null,
    val website: String? = null,
    val logoUrl: String? = null,
    val status: String = "ACTIVE",
    val branchCount: Int = 0,
    val createdAt: String? = null,
)

@Serializable
data class DeletionSummaryItemDto(val key: String, val count: Int = 0)

/** `GET /schools/:id/deletion-preview`. */
@Serializable
data class SchoolDeletionPreviewDto(
    val schoolId: String = "",
    val code: String = "",
    val name: String = "",
    val status: String = "ACTIVE",
    val lastActiveSchool: Boolean = false,
    val summary: List<DeletionSummaryItemDto> = emptyList(),
    val removedUsers: Int = 0,
    val keptUsers: Int = 0,
    val totalRows: Int = 0,
)

/** `GET /schools/:id/deletion-status` and `DELETE /schools/:id`. */
@Serializable
data class SchoolDeletionStatusDto(
    val schoolId: String = "",
    val state: String = "IDLE",
    val error: String? = null,
)

@Serializable
data class DeleteSchoolBody(val confirmCode: String)
