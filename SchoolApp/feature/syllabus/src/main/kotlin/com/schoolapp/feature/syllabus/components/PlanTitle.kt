package com.schoolapp.feature.syllabus.components

import com.schoolapp.core.model.syllabus.SyllabusPlan

internal fun SyllabusPlan.displayTitle(): String {
    val section = listOfNotNull(className, sectionName).joinToString(" - ")
    return listOf(section, subjectName.orEmpty()).filter { it.isNotBlank() }.joinToString(" · ").ifBlank { id }
}
