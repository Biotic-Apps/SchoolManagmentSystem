package com.schoolapp.core.model.message

data class ThreadParticipant(val userId: String, val name: String, val role: String?)

data class MessageThread(
    val id: String,
    val subject: String,
    val studentId: String?,
    val studentName: String?,
    val className: String?,
    val sectionName: String?,
    val participants: List<ThreadParticipant>,
    val lastMessageBody: String?,
    val lastMessageAt: String?,
    val lastSenderName: String?,
    val unreadCount: Int,
    val closed: Boolean,
)
