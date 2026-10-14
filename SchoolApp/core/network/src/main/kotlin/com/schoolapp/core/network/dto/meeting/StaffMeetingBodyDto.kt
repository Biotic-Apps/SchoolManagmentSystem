package com.schoolapp.core.network.dto.meeting

import kotlinx.serialization.Serializable

/** `POST /meetings` without a slot: staff schedule a meeting with a guardian. */
@Serializable
data class StaffMeetingBodyDto(
    val studentId: String,
    val guardianId: String,
    val date: String,
    val startTime: String,
    val endTime: String,
    val mode: String,
    val agenda: String,
    val location: String? = null,
)
