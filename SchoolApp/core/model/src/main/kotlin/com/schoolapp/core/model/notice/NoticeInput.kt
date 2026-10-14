package com.schoolapp.core.model.notice

/** Body of `POST /notices` and `PATCH /notices/{id}` (drafts only). */
data class NoticeInput(
    val title: String,
    val body: String,
    val audience: NoticeAudience,
    val attachmentFileIds: List<String> = emptyList(),
    val expiresOn: String? = null,
    val pinned: Boolean = false,
)
