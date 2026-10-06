package com.schoolapp.core.network.dto.syllabus

import kotlinx.serialization.Serializable

@Serializable
data class TopicProgressBodyDto(val status: String, val completedOn: String? = null, val note: String? = null)
