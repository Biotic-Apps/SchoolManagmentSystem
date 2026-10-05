package com.schoolapp.core.model.organisation

data class SchoolClass(
    val id: String,
    val name: String,
    val levelOrder: Int?,
    val subjectCount: Int,
)
