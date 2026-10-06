package com.schoolapp.demo

import com.schoolapp.core.model.common.PersonRef
import com.schoolapp.core.model.meeting.FollowUp
import com.schoolapp.core.model.meeting.FollowUpStatus
import com.schoolapp.core.model.meeting.Meeting
import com.schoolapp.core.model.meeting.MeetingMode
import com.schoolapp.core.model.meeting.MeetingSlot
import com.schoolapp.core.model.meeting.MeetingStatus
import kotlinx.coroutines.flow.MutableStateFlow

/**
 * Demo Teacher's after-school slots on the next 4 school days (one booked by Imran Khan for Ayesha) and a
 * completed meeting from last week with follow-ups.
 */
internal object DemoMeetingsData {
    const val BOOKED = "BOOKED"
    const val OPEN = "OPEN"

    private val times = listOf("13:30" to "13:50", "14:00" to "14:20", "14:30" to "14:50")
    val ayesha = PersonRef(DemoPeopleData.CHILD_1, "Ayesha Khan")

    val slots = MutableStateFlow(seedSlots())
    val meetings = MutableStateFlow(seedMeetings())

    private fun seedSlots(): List<MeetingSlot> = DemoDates.nextSchoolDays(4).flatMapIndexed { dayIndex, day ->
        times.mapIndexed { index, (start, end) ->
            MeetingSlot(
                "demo-slot-$dayIndex-$index", DemoActors.teacher, day.toString(), start, end,
                if (index == 2) MeetingMode.PHONE else MeetingMode.IN_PERSON, if (index == 2) null else "Room 12",
                if (dayIndex == 0 && index == 1) BOOKED else OPEN,
            )
        }
    }

    private fun seedMeetings(): List<Meeting> {
        val booked = slots.value.first { it.status == BOOKED }
        val past = DemoDates.previousSchoolDays(6).last().toString()
        return listOf(
            Meeting(
                "demo-mt-1", ayesha, DemoActors.parent, DemoActors.teacher, booked.date, booked.startTime, booked.endTime,
                booked.mode, booked.location, "Progress in maths and the upcoming test", MeetingStatus.SCHEDULED,
                notes = null, summary = null, followUps = emptyList(),
            ),
            Meeting(
                "demo-mt-0", ayesha, DemoActors.parent, DemoActors.teacher, past, "13:30", "13:50", MeetingMode.IN_PERSON,
                "Room 12", "Settling in after the summer break", MeetingStatus.COMPLETED,
                notes = "Ayesha is attentive; needs practice with word problems.",
                summary = "Ayesha is doing well. We agreed on 15 minutes of maths practice at home daily.",
                followUps = listOf(
                    FollowUp("demo-fu-1", "Share fractions practice worksheet", DemoActors.teacher.name, DemoDates.today().plusDays(2).toString(), FollowUpStatus.OPEN, "Ayesha Khan"),
                    FollowUp("demo-fu-2", "Move Ayesha to the front row", DemoActors.teacher.name, past, FollowUpStatus.DONE, "Ayesha Khan"),
                ),
            ),
        )
    }
}
