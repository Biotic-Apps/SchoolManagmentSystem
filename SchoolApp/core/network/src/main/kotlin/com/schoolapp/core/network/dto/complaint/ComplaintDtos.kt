package com.schoolapp.core.network.dto.complaint

import com.schoolapp.core.network.dto.common.IdNameDto
import com.schoolapp.core.network.dto.common.UserRefDto
import com.schoolapp.core.network.dto.files.AttachmentDto
import kotlinx.serialization.Serializable

@Serializable
data class ComplaintDto(
    val id: String,
    val ticketNo: String? = null,
    val category: String? = null,
    val subject: String? = null,
    val description: String? = null,
    val status: String? = null,
    val escalationLevel: Int = 0,
    val slaDueAt: String? = null,
    val overdue: Boolean = false,
    val anonymous: Boolean = false,
    val complainant: UserRefDto? = null,
    val against: IdNameDto? = null,
    val student: IdNameDto? = null,
    val assignee: IdNameDto? = null,
    val updates: List<ComplaintUpdateDto> = emptyList(),
    val createdAt: String? = null,
)

@Serializable
data class ComplaintUpdateDto(
    val id: String? = null,
    val author: IdNameDto? = null,
    val message: String? = null,
    val status: String? = null,
    val at: String? = null,
    val createdAt: String? = null,
    val attachments: List<AttachmentDto> = emptyList(),
)

/** `POST /complaints`. */
@Serializable
data class ComplaintBodyDto(
    val category: String,
    val subject: String,
    val description: String,
    val studentId: String? = null,
    val anonymous: Boolean? = null,
    val attachmentFileIds: List<String>? = null,
)

@Serializable
data class ComplaintUpdateBodyDto(val message: String, val status: String? = null, val attachmentFileIds: List<String>? = null)

/** `POST /complaints/{id}/assign`. */
@Serializable
data class AssignComplaintBodyDto(val assigneeUserId: String)
