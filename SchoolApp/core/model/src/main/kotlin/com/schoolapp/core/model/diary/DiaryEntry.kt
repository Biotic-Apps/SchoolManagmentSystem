package com.schoolapp.core.model.diary

import com.schoolapp.core.model.files.Attachment

enum class DiaryStatus { DRAFT, SUBMITTED, PUBLISHED, RETURNED, PENDING_REVIEW }

data class DiaryEntry(
    val id: String,
    val sectionId: String,
    val className: String?,
    val sectionName: String?,
    val subjectId: String?,
    val subjectName: String?,
    val date: String,
    val topics: String,
    val homework: String?,
    val dueDate: String?,
    val attachments: List<Attachment>,
    val status: DiaryStatus,
    val revision: Int,
    val authorName: String?,
    val onBehalfOfName: String?,
    /** Reviewer note when RETURNED. */
    val comment: String?,
    val publishedAt: String?,
    /** Approval request holding a SUBMITTED (moderation) or PENDING_REVIEW entry. */
    val approvalId: String? = null,
) {
    val slotKey: String get() = diarySlotKey(sectionId, subjectId, date)
}

/** Identifies the one entry per section + subject + date. */
fun diarySlotKey(sectionId: String, subjectId: String?, date: String) = "$sectionId|${subjectId.orEmpty()}|$date"
