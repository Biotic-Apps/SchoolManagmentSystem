package com.schoolapp.core.model.progress

/** A homework set for the child's section and the teacher's tick; [status] null = not checked yet. */
data class HomeworkCompletionItem(
    val id: String,
    val date: String,
    val dueDate: String?,
    val subjectName: String?,
    val homework: String,
    val status: HomeworkStatus?,
)
