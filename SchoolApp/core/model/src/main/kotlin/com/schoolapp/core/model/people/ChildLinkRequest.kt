package com.schoolapp.core.model.people

data class ChildLinkRequest(
    val id: String,
    val guardianName: String?,
    val guardianPhone: String?,
    val studentName: String?,
    val admissionNo: String?,
    val className: String?,
    val sectionName: String?,
    val relation: String?,
    val status: String?,
    val createdAt: String?,
)
