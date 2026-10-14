package com.schoolapp.core.network.dto.organisation

import kotlinx.serialization.Serializable

@Serializable
data class SessionTermDto(
    val id: String,
    val sessionId: String? = null,
    val name: String,
    val startDate: String,
    val endDate: String,
)
