package com.schoolapp.core.network.dto.notice

import com.schoolapp.core.network.dto.common.UserRefDto
import com.schoolapp.core.network.dto.files.AttachmentDto
import kotlinx.serialization.Serializable

@Serializable
data class NoticeDto(
    val id: String,
    val branchId: String? = null,
    val title: String = "",
    val body: String? = null,
    val status: String? = null,
    val pinned: Boolean = false,
    val publishedAt: String? = null,
    val createdAt: String? = null,
    val expiresOn: String? = null,
    val author: UserRefDto? = null,
    val createdBy: UserRefDto? = null,
    val audience: NoticeAudienceDto? = null,
    val attachments: List<AttachmentDto> = emptyList(),
    val audienceLabel: String? = null,
    val isRead: Boolean? = null,
    val read: Boolean? = null,
    val readAt: String? = null,
    val approvalId: String? = null,
)

/** `POST /notices` and `PATCH /notices/{id}`; null fields are left out. */
@Serializable
data class NoticeBodyDto(
    val title: String,
    val body: String,
    val audience: NoticeAudienceDto,
    val attachmentFileIds: List<String>? = null,
    val expiresOn: String? = null,
    val pinned: Boolean? = null,
)

@Serializable
data class NoticeAudienceDto(
    val schoolWide: Boolean? = null,
    val branchIds: List<String>? = null,
    val classIds: List<String>? = null,
    val sectionIds: List<String>? = null,
    val staffOnly: Boolean? = null,
    val guardianIds: List<String>? = null,
)

/** `GET /notices/{id}/reads`. */
@Serializable
data class NoticeReadsDto(val total: Int = 0, val read: Int = 0, val unread: Int? = null)
