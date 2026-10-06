package com.schoolapp.core.network.dto.syllabus

import kotlinx.serialization.Serializable

@Serializable
data class SyllabusPlanDto(
    val id: String,
    val sectionId: String? = null,
    val sectionName: String? = null,
    val className: String? = null,
    val subjectId: String? = null,
    val subjectName: String? = null,
    val sessionId: String? = null,
    val revision: Int? = null,
    val status: String? = null,
    val chapters: List<ChapterDto> = emptyList(),
    val progress: ProgressDto? = null,
)

@Serializable
data class ChapterDto(val id: String, val title: String, val order: Int = 0, val topics: List<TopicDto> = emptyList())

@Serializable
data class TopicDto(
    val id: String,
    val title: String,
    val order: Int = 0,
    val targetDate: String? = null,
    val status: String? = null,
    val completedOn: String? = null,
    val isDelayed: Boolean = false,
    val pendingReview: Boolean = false,
)

@Serializable
data class ProgressDto(val total: Int = 0, val completed: Int = 0, val delayed: Int = 0, val percent: Double = 0.0)
