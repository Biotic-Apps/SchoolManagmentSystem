package com.schoolapp.core.model.meeting

import com.schoolapp.core.model.common.PersonRef

enum class MeetingMode { IN_PERSON, PHONE, VIDEO }

enum class MeetingStatus { SCHEDULED, COMPLETED, CANCELLED, NO_SHOW }

enum class MeetingBox { UPCOMING, PAST }

/** Dates `YYYY-MM-DD`, times API `HH:mm` (shown 12-hour). */
data class Meeting(
    val id: String,
    val student: PersonRef?,
    val guardian: PersonRef?,
    val staff: PersonRef?,
    val date: String,
    val startTime: String,
    val endTime: String,
    val mode: MeetingMode,
    val location: String?,
    val agenda: String?,
    val status: MeetingStatus,
    /** Staff only. */
    val notes: String?,
    /** Shown to the parent when shared. */
    val summary: String?,
    val followUps: List<FollowUp>,
)

data class MeetingSlot(
    val id: String,
    val staff: PersonRef?,
    val date: String,
    val startTime: String,
    val endTime: String,
    val mode: MeetingMode,
    val location: String?,
    val status: String?,
)
