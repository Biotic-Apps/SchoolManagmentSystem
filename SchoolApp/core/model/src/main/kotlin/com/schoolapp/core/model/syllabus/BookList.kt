package com.schoolapp.core.model.syllabus

data class BookList(
    val id: String,
    val className: String?,
    val revision: Int?,
    val status: String?,
    val approvedAt: String?,
    val items: List<BookItem>,
)
