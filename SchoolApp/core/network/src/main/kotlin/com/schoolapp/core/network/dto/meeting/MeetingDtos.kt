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
data class MeetingTeacherDto(
    val userId: String,
    val name: String = "",
    val roles: List<String> = emptyList(),
    val openSlots: Int = 0,
)

/** `POST /meetings/requests`: parent suggests a time (end defaults to +30 min). */
@Serializable
data class MeetingRequestBodyDto(
    val studentId: String,
    val staffUserId: String,
    val date: String,
    val startTime: String,
    val mode: String,
    val agenda: String,
)

/** `POST /meetings/{id}/accept`: omitted fields keep the parent's suggestion. */
@Serializable
data class AcceptMeetingBodyDto(
    val date: String? = null,
    val startTime: String? = null,
    val endTime: String? = null,
    val mode: String? = null,
    val location: String? = null,
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

/** `POST /meetings/slots`: several slots at once (max 50). */
@Serializable
data class CreateSlotsBodyDto(val slots: List<SlotBodyDto>)

@Serializable
data class SlotBodyDto(
    val date: String,
    val startTime: String,
    val endTime: String,
    val mode: String,
    val location: String? = null,
)
