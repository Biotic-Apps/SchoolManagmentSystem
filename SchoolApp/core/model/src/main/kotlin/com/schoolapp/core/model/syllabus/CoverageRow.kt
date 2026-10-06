package com.schoolapp.core.model.syllabus

data class CoverageRow(
    val sectionId: String?,
    val className: String?,
    val sectionName: String?,
    val subjectName: String?,
    val progress: PlanProgress,
)
