package com.schoolapp.core.model.people

data class Guardian(
    val id: String,
    val name: String,
    val relation: String?,
    val phone: String?,
    val email: String?,
    val occupation: String?,
    val address: String?,
    val hasAccount: Boolean,
)
