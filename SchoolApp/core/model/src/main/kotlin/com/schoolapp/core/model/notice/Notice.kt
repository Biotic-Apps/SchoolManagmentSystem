package com.schoolapp.core.model.notice

enum class NoticeStatus { DRAFT, PENDING_REVIEW, PUBLISHED, EXPIRED }

data class Notice(
    val id: String,
    val title: String,
    val body: String,
    val status: NoticeStatus,
    val pinned: Boolean,
    val publishedAt: String?,
    val expiresOn: String?,
    val authorName: String?,
    val audienceLabel: String?,
    val isRead: Boolean,
)
