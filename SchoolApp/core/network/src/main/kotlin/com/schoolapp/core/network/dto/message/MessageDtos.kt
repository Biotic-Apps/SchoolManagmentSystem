package com.schoolapp.core.network.dto.message

import com.schoolapp.core.network.dto.common.UserRefDto
import com.schoolapp.core.network.dto.files.AttachmentDto
import kotlinx.serialization.Serializable

@Serializable
data class ThreadDto(
    val id: String,
    val subject: String? = null,
    val student: ThreadStudentDto? = null,
    val participants: List<UserRefDto> = emptyList(),
    val lastMessage: LastMessageDto? = null,
    val unreadCount: Int = 0,
    val closed: Boolean = false,
)

@Serializable
data class ThreadStudentDto(
    val id: String? = null,
    val name: String? = null,
    val className: String? = null,
    val sectionName: String? = null,
)

@Serializable
data class LastMessageDto(val body: String? = null, val at: String? = null, val senderName: String? = null)

@Serializable
data class MessageDto(
    val id: String,
    val threadId: String? = null,
    val sender: UserRefDto? = null,
    val body: String? = null,
    val attachments: List<AttachmentDto> = emptyList(),
    val sentAt: String? = null,
    val createdAt: String? = null,
    val readByOthers: Boolean = false,
)

/** `GET /messages/threads/:id`. */
@Serializable
data class ThreadDetailDto(
    val thread: ThreadDto,
    val messages: List<MessageDto> = emptyList(),
    val nextCursor: String? = null,
)

@Serializable
data class SendMessageBodyDto(val body: String, val attachmentFileIds: List<String>? = null)

@Serializable
data class NewThreadBodyDto(
    val studentId: String,
    val staffUserId: String? = null,
    val subject: String,
    val body: String,
    val attachmentFileIds: List<String>? = null,
)
