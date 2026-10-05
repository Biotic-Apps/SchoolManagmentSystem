package com.schoolapp.core.model

data class ChildSummary(
    val id: String,
    val fullName: String,
    val className: String? = null,
    val sectionName: String? = null,
    val branchName: String? = null,
    val photoUrl: String? = null,
)
