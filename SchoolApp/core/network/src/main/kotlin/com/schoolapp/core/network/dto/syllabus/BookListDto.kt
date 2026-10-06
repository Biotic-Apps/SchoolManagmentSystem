package com.schoolapp.core.network.dto.syllabus

import kotlinx.serialization.Serializable

@Serializable
data class BookListDto(
    val id: String,
    val classId: String? = null,
    val className: String? = null,
    val revision: Int? = null,
    val status: String? = null,
    val approvedAt: String? = null,
    val items: List<BookItemDto> = emptyList(),
)

@Serializable
data class BookItemDto(
    val subjectId: String? = null,
    val subjectName: String? = null,
    val title: String,
    val author: String? = null,
    val publisher: String? = null,
    val isbn: String? = null,
    val isMandatory: Boolean = true,
    val priceMinor: Long? = null,
)
