package com.schoolapp.feature.meetings.domain

import com.schoolapp.core.model.meeting.MeetingMode

enum class MeetingTimeProblem { DATE_PAST, END_BEFORE_START, LOCATION_TOO_LONG }

/** Date (`YYYY-MM-DD`), `HH:mm` times, mode and place of one meeting being scheduled or re-timed. */
data class MeetingTimeDraft(
    val date: String,
    val startTime: String = SlotTimes.DEFAULT_START,
    val endTime: String = SlotTimes.DEFAULT_END,
    val mode: MeetingMode = MeetingMode.IN_PERSON,
    val location: String = "",
) {
    /** Client-side mirror of the API's `assertMeetingTimes` (no past day, end after start). */
    fun problems(today: String): Set<MeetingTimeProblem> = buildSet {
        if (date < today) add(MeetingTimeProblem.DATE_PAST)
        if (endTime <= startTime) add(MeetingTimeProblem.END_BEFORE_START)
        if (location.trim().length > SlotValidator.MAX_LOCATION) add(MeetingTimeProblem.LOCATION_TOO_LONG)
    }

    /** Moving the start keeps the meeting length (at least 15 minutes). */
    fun withStart(value: String): MeetingTimeDraft {
        val length = (SlotTimes.minutes(endTime) - SlotTimes.minutes(startTime)).coerceAtLeast(SlotTimes.MIN_LENGTH_MINUTES)
        return copy(startTime = value, endTime = SlotTimes.time(SlotTimes.minutes(value) + length))
    }
}
