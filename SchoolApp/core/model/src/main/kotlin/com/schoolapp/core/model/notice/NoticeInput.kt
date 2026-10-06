package com.schoolapp.core.model.notice

/** Simple audience: the whole branch, or chosen classes / sections. */
data class NoticeInput(
    val title: String,
    val body: String,
    val branchId: String?,
    val wholeBranch: Boolean,
    val classIds: List<String> = emptyList(),
    val sectionIds: List<String> = emptyList(),
    val expiresOn: String? = null,
    val pinned: Boolean = false,
)
