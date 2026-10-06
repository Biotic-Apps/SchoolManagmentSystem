package com.schoolapp.core.model.syllabus

data class SyllabusPlan(
    val id: String,
    val sectionId: String?,
    val sectionName: String?,
    val className: String?,
    val subjectId: String?,
    val subjectName: String?,
    val revision: Int?,
    val status: String?,
    val chapters: List<SyllabusChapter>,
    val progress: PlanProgress,
)
