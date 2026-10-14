package com.schoolapp.core.model.message

/** Staff member a parent may address about a child. */
data class MessageRecipient(
    val userId: String,
    val name: String,
    val role: RecipientRole,
    /** Subjects taught (joined by the server) for subject teachers. */
    val subjectName: String?,
)

enum class RecipientRole { CLASS_TEACHER, SUBJECT_TEACHER, PRINCIPAL, OTHER }

/** Inbox filter: own threads (optionally unread only) or the branch-wide read-only view. */
data class ThreadQuery(
    val studentId: String? = null,
    val unreadOnly: Boolean = false,
    val branchScope: Boolean = false,
)
