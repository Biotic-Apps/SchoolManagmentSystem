package com.schoolapp.core.model.complaint

data class ComplaintInput(
    val category: ComplaintCategory,
    val subject: String,
    val description: String,
    val studentId: String? = null,
    val anonymous: Boolean = false,
    val attachmentFileIds: List<String> = emptyList(),
)
