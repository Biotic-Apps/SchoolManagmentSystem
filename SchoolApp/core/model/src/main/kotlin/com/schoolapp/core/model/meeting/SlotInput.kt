package com.schoolapp.core.model.meeting

/** One bookable slot a staff member publishes; [date] `YYYY-MM-DD`, times 24-hour `HH:mm`. */
data class SlotInput(
    val date: String,
    val startTime: String,
    val endTime: String,
    val mode: MeetingMode,
    val location: String?,
)

/** API slot statuses; staff lists exclude `CANCELLED`. */
object SlotStatus {
    const val OPEN = "OPEN"
    const val BOOKED = "BOOKED"
}
