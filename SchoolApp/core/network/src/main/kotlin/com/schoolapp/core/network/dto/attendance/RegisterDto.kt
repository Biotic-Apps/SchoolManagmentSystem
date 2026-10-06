package com.schoolapp.core.network.dto.attendance

import com.schoolapp.core.network.dto.common.IdNameDto
import kotlinx.serialization.Serializable

/** `Register`; also stored as JSON in the device cache. */
@Serializable
data class RegisterDto(
    val id: String? = null,
    val sectionId: String = "",
    val date: String = "",
    val status: String? = null,
    val version: Int = 0,
    val submittedBy: IdNameDto? = null,
    val onBehalfOf: IdNameDto? = null,
    val lockedAt: String? = null,
    val approvalId: String? = null,
    val entries: List<RegisterEntryDto> = emptyList(),
)

@Serializable
data class RegisterEntryDto(
    val entryId: String? = null,
    val studentId: String,
    val name: String? = null,
    val rollNo: Int? = null,
    val photoUrl: String? = null,
    val status: String? = null,
    val remark: String? = null,
    val onLeave: Boolean = false,
)
