package com.schoolapp.core.model.message

import com.schoolapp.core.model.files.Attachment

data class ChatMessage(
    val id: String,
    val threadId: String,
    val senderUserId: String?,
    val senderName: String,
    val senderRole: String?,
    val body: String,
    val attachments: List<Attachment>,
    /** ISO timestamp. */
    val sentAt: String,
    val readByOthers: Boolean,
)

data class ThreadDetail(val thread: MessageThread, val messages: List<ChatMessage>, val olderCursor: String?)

/** `deliveredSilently` = sent outside office hours, no push. */
data class SentMessage(val message: ChatMessage, val deliveredSilently: Boolean)

data class NewThreadInput(
    val studentId: String,
    val staffUserId: String?,
    val subject: String,
    val body: String,
    val attachmentFileIds: List<String> = emptyList(),
)
