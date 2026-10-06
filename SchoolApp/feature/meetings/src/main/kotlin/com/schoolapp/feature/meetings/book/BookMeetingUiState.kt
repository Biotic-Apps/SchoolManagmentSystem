package com.schoolapp.feature.meetings.book

import androidx.compose.runtime.Immutable
import com.schoolapp.core.common.result.AppError
import com.schoolapp.core.model.meeting.MeetingSlot

/** Open slots of one day; [date] is `YYYY-MM-DD`. */
@Immutable
data class SlotDay(val date: String, val slots: List<MeetingSlot>)

@Immutable
data class BookMeetingUiState(
    val isLoading: Boolean = true,
    val error: AppError? = null,
    val childId: String? = null,
    val childName: String? = null,
    val days: List<SlotDay> = emptyList(),
    val selected: MeetingSlot? = null,
    val agenda: String = "",
    val agendaMissing: Boolean = false,
    val isBooking: Boolean = false,
    val bookError: AppError? = null,
    /** The picked slot was booked by someone else meanwhile (409); slots were refreshed. */
    val slotTaken: Boolean = false,
    val booked: Boolean = false,
)
