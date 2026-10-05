package com.schoolapp.core.network.dto.organisation

import kotlinx.serialization.Serializable

@Serializable
data class CalendarEventDto(
    val id: String,
    val schoolId: String? = null,
    val branchId: String? = null,
    val type: String? = null,
    val title: String,
    val startDate: String? = null,
    val endDate: String? = null,
    val description: String? = null,
)
