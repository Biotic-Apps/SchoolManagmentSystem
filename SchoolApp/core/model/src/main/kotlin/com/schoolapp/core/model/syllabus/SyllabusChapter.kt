package com.schoolapp.core.model.syllabus

data class SyllabusChapter(val id: String, val title: String, val order: Int, val topics: List<SyllabusTopic>)
