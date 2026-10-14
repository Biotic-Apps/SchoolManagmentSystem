package com.schoolapp.core.network.dto.leave

import com.schoolapp.core.network.dto.common.IdNameDto
import kotlinx.serialization.Serializable

@Serializable
data class LeaveDto(
    val id: String,
    val kind: String? = null,
    val subject: IdNameDto? = null,
    val from: String = "",
    val to: String = "",
    val days: Int = 0,
    val type: String? = null,
    val reason: String? = null,
    val status: String? = null,
    val requestedBy: IdNameDto? = null,
    val decidedBy: IdNameDto? = null,
    val comment: String? = null,
    val createdAt: String? = null,
)

/** `POST /leave`: parent sends [studentId]; staff send [type]. */
@Serializable
data class LeaveBodyDto(
    val studentId: String? = null,
    val type: String? = null,
    val from: String,
    val to: String,
    val reason: String,
    val attachmentFileId: String? = null,
)
