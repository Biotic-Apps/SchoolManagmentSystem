package com.schoolapp.core.data.messages

import com.schoolapp.core.data.common.toAttachments
import com.schoolapp.core.model.message.ChatMessage
import com.schoolapp.core.model.message.MessageThread
import com.schoolapp.core.model.message.ThreadDetail
import com.schoolapp.core.model.message.ThreadParticipant
import com.schoolapp.core.network.dto.message.MessageDto
import com.schoolapp.core.network.dto.message.ThreadDetailDto
import com.schoolapp.core.network.dto.message.ThreadDto

internal fun ThreadDto.toModel() = MessageThread(
    id = id,
    subject = subject.orEmpty(),
    studentId = student?.id,
    studentName = student?.name,
    className = student?.className,
    sectionName = student?.sectionName,
    participants = participants.mapNotNull { p -> (p.userId ?: p.id)?.let { ThreadParticipant(it, p.name.orEmpty(), p.role) } },
    lastMessageBody = lastMessage?.body,
    lastMessageAt = lastMessage?.at,
    lastSenderName = lastMessage?.senderName,
    unreadCount = unreadCount,
    closed = closed,
)

internal fun MessageDto.toModel(fallbackThreadId: String) = ChatMessage(
    id = id,
    threadId = threadId ?: fallbackThreadId,
    senderUserId = sender?.userId ?: sender?.id,
    senderName = sender?.name.orEmpty(),
    senderRole = sender?.role,
    body = body.orEmpty(),
    attachments = attachments.toAttachments(),
    sentAt = sentAt ?: createdAt.orEmpty(),
    readByOthers = readByOthers,
)

/**
 * Messages oldest first; [cursor] pages older messages.
 * The `before` param expects an ISO timestamp, not a message id.
 * Prefer the server's `meta.nextCursor`; fall back to the oldest message's `sentAt`.
 */
internal fun ThreadDetailDto.toModel(cursor: String?) : ThreadDetail {
    val sorted = messages.map { it.toModel(thread.id) }.sortedBy { it.sentAt }
    return ThreadDetail(
        thread = thread.toModel(),
        messages = sorted,
        olderCursor = cursor ?: sorted.firstOrNull()?.sentAt,
    )
}

/** Threads with the newest activity first. */
internal fun List<MessageThread>.newestFirst(): List<MessageThread> = sortedByDescending { it.lastMessageAt.orEmpty() }
