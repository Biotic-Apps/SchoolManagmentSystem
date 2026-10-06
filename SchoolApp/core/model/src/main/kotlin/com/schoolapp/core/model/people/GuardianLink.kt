package com.schoolapp.core.model.people

data class GuardianLink(
    val id: String,
    val guardian: Guardian,
    val relation: String?,
    val isPrimary: Boolean,
    val status: String?,
)
