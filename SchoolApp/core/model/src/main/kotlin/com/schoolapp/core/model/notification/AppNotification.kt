package com.schoolapp.core.model.notification

data class AppNotification(
    val id: String,
    val category: String?,
    val title: String,
    val body: String?,
    val isRead: Boolean,
    val createdAt: String?,
)
