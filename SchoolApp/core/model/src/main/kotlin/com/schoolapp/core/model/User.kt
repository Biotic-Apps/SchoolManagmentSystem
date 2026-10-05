package com.schoolapp.core.model

data class User(
    val id: String,
    val fullName: String,
    val email: String? = null,
    val phone: String? = null,
    val avatarUrl: String? = null,
    val mustChangePassword: Boolean = false,
)
