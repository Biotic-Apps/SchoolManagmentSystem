package com.schoolapp.core.network.dto.meeting

import com.schoolapp.core.network.dto.common.IdNameDto
import com.schoolapp.core.network.dto.common.UserRefDto
import kotlinx.serialization.Serializable

@Serializable
data class MeetingDto(
    val id: String,
    val student: IdNameDto? = null,
    val guardian: IdNameDto? = null,
    val staff: UserRefDto? = null,
    val date: String = "",
    val startTime: String = "",
    val endTime: String = "",
    val mode: String? = null,
    val location: String? = null,
    val agenda: String? = null,
    val status: String? = null,
    val notes: String? = null,
    val summary: String? = null,
    val followUps: List<FollowUpDto> = emptyList(),
)

@Serializable
data class MeetingSlotDto(
    val id: String,
    val staff: UserRefDto? = null,
    val date: String = "",
    val startTime: String = "",
    val endTime: String = "",
    val mode: String? = null,
    val location: String? = null,
    val status: String? = null,
)

@Serializable
data class FollowUpDto(
    val id: String,
    val title: String = "",
    val owner: UserRefDto? = null,
    val dueDate: String? = null,
    val status: String? = null,
    val student: IdNameDto? = null,
)

@Serializable
data class BookMeetingBodyDto(val slotId: String, val studentId: String, val agenda: String)

@Serializable
data class CompleteMeetingBodyDto(
    val notes: String,
    val shareSummaryWithParent: Boolean,
    val summary: String? = null,
    val followUps: List<FollowUpBodyDto>? = null,
)

@Serializable
data class FollowUpBodyDto(val title: String, val ownerUserId: String? = null, val dueDate: String)
