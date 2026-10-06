package com.schoolapp.core.model.diary

/** Upsert body for `PUT /diary`. */
data class DiaryInput(
    val sectionId: String,
    val subjectId: String,
    val date: String,
    val topics: String,
    val homework: String?,
    val dueDate: String?,
    val attachmentFileIds: List<String> = emptyList(),
) {
    val slotKey: String get() = diarySlotKey(sectionId, subjectId, date)
}
