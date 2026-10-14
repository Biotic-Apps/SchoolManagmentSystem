package com.schoolapp.core.model.meeting

/** Staff confirm a parent's request, optionally at another date/time/mode/place (parent is notified). */
data class AcceptMeetingInput(
    val date: String,
    val startTime: String,
    val endTime: String,
    val mode: MeetingMode,
    val location: String?,
)

/** Staff-initiated meeting with one of a student's verified guardians (no slot). */
data class StaffMeetingInput(
    val studentId: String,
    /** Guardian record id (not the link id). */
    val guardianId: String,
    val date: String,
    val startTime: String,
    val endTime: String,
    val mode: MeetingMode,
    val agenda: String,
    val location: String?,
)
