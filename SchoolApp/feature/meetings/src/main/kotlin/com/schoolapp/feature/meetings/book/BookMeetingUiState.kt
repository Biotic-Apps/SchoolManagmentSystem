package com.schoolapp.feature.meetings.book

import androidx.compose.runtime.Immutable
import com.schoolapp.core.common.result.AppError
import com.schoolapp.core.model.meeting.MeetingMode
import com.schoolapp.core.model.meeting.MeetingSlot
import com.schoolapp.core.model.meeting.MeetingTeacher

/** Open slots of one day; [date] is `YYYY-MM-DD`. */
@Immutable
data class SlotDay(val date: String, val slots: List<MeetingSlot>)

/** A time the parent suggests when no open slot suits them; [date] `YYYY-MM-DD`, [startTime] `HH:mm`. */
@Immutable
data class RequestDraft(
    val date: String,
    val startTime: String = "13:00",
    val mode: MeetingMode = MeetingMode.IN_PERSON,
)

@Immutable
data class BookMeetingUiState(
    val isLoading: Boolean = true,
    val error: AppError? = null,
    val childId: String? = null,
    val childName: String? = null,
    val today: String = "",
    /** The child's teachers and principal, including those without open slots. */
    val teachers: List<MeetingTeacher> = emptyList(),
    val teacherId: String? = null,
    /** Open slots of the chosen teacher (all teachers until one is chosen). */
    val days: List<SlotDay> = emptyList(),
    val selected: MeetingSlot? = null,
    /** Non-null while the parent is suggesting a time instead of picking a slot. */
    val request: RequestDraft? = null,
    val agenda: String = "",
    val agendaMissing: Boolean = false,
    val isBooking: Boolean = false,
    val bookError: AppError? = null,
    /** The picked slot was booked by someone else meanwhile (409); slots were refreshed. */
    val slotTaken: Boolean = false,
    val booked: Boolean = false,
    /** The suggested time was sent; the teacher confirms or declines. */
    val requested: Boolean = false,
) {
    val teacher: MeetingTeacher? get() = teachers.firstOrNull { it.userId == teacherId }
}
