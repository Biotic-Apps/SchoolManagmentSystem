package com.schoolapp.core.model.meeting

import com.schoolapp.core.model.common.PersonRef

enum class MeetingMode { IN_PERSON, PHONE, VIDEO }

/** REQUESTED: a parent suggested a time; the teacher accepts (SCHEDULED) or declines (CANCELLED). */
enum class MeetingStatus { REQUESTED, SCHEDULED, COMPLETED, CANCELLED, NO_SHOW }

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

/** One of the child's teachers (or the principal) a parent can meet; [roles] e.g. "Class teacher", "Mathematics". */
data class MeetingTeacher(
    val userId: String,
    val name: String,
    val roles: List<String>,
    val openSlots: Int,
)

/** Parent suggests a time when no open slot suits them; the server makes it 30 minutes long. */
data class MeetingRequestInput(
    val studentId: String,
    val staffUserId: String,
    val date: String,
    val startTime: String,
    val mode: MeetingMode,
    val agenda: String,
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
