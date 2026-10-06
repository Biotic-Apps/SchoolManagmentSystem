package com.schoolapp.core.model.syllabus

data class BookItem(
    val title: String,
    val subjectName: String?,
    val author: String?,
    val publisher: String?,
    val isMandatory: Boolean,
    val priceMinor: Long?,
)
