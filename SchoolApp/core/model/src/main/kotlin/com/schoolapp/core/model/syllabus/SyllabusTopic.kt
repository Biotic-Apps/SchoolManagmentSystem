package com.schoolapp.core.model.syllabus

data class SyllabusTopic(
    val id: String,
    val title: String,
    val order: Int,
    val targetDate: String?,
    val status: TopicStatus,
    val completedOn: String?,
    val isDelayed: Boolean,
    val pendingReview: Boolean,
)
