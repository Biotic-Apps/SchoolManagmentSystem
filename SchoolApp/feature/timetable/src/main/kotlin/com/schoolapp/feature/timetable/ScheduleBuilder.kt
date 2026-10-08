package com.schoolapp.feature.timetable

import com.schoolapp.core.common.time.TimeFormat
import com.schoolapp.core.model.timetable.Period
import com.schoolapp.core.model.timetable.SectionTimetable
import com.schoolapp.core.model.timetable.TeacherSlot
import com.schoolapp.core.model.timetable.TimetableSlot
import java.time.LocalTime

/** Turns API slots and bell rows into [ScheduleRow]s. */
internal object ScheduleBuilder {

    /** Week views (`/timetables/me`): lessons only; [showTeacher] for the child view, else the section. */
    fun fromSlots(slots: List<TeacherSlot>, showTeacher: Boolean): List<ScheduleRow> = slots.map { slot ->
        val section = listOfNotNull(slot.className, slot.sectionName).joinToString(" · ").ifBlank { null }
        ScheduleRow(
            day = slot.day,
            periodIndex = slot.periodIndex,
            startTime = slot.startTime,
            endTime = slot.endTime,
            timeRange = timeRange(slot.startTime, slot.endTime),
            title = slot.subjectName ?: section.orEmpty(),
            subtitle = if (showTeacher) slot.staffName else section,
            room = slot.roomName,
            isSubstitute = slot.isSubstitute,
            periodNumber = slot.periodNumber,
            teacher = slot.staffName,
            section = section,
        )
    }.sortedWith(compareBy({ it.day }, { it.periodIndex }))

    /** Section view: the placed lessons of every day (structure comes from [DayPlanner]). */
    fun lessonsOf(timetable: SectionTimetable): List<ScheduleRow> = timetable.slots.mapNotNull { slot ->
        val period = timetable.periodsFor(slot.day).firstOrNull { it.index == slot.periodIndex }
        lessonRow(slot, period)
    }.sortedWith(compareBy({ it.day }, { it.periodIndex }))

    private fun lessonRow(slot: TimetableSlot, period: Period?) = ScheduleRow(
        day = slot.day,
        periodIndex = slot.periodIndex,
        startTime = period?.startTime,
        endTime = period?.endTime,
        timeRange = timeRange(period?.startTime, period?.endTime),
        title = slot.subjectName.orEmpty(),
        subtitle = slot.staffName,
        room = slot.roomName,
        periodNumber = period?.number,
        teacher = slot.staffName,
    )

    /** A bell row without a lesson: a break, or a free teaching period. */
    fun emptyRow(day: Int, period: Period) = ScheduleRow(
        day = day,
        periodIndex = period.index,
        startTime = period.startTime,
        endTime = period.endTime,
        timeRange = timeRange(period.startTime, period.endTime),
        title = if (period.isBreak) period.label.orEmpty() else "",
        subtitle = null,
        room = null,
        kind = if (period.isBreak) RowKind.BREAK else RowKind.FREE,
        periodNumber = period.number,
    )

    /** 12-hour range; the AM/PM suffix is written once when both ends share it ("9:20 – 10:00 AM"). */
    fun timeRange(start: String?, end: String?): String {
        val from = start?.let(TimeFormat::parseTime)
        val to = end?.let(TimeFormat::parseTime)
        if (from == null || to == null) {
            return listOfNotNull(start?.let(TimeFormat::formatTime12), end?.let(TimeFormat::formatTime12)).joinToString(" – ")
        }
        val sameHalf = (from.hour < 12) == (to.hour < 12)
        val first = TimeFormat.formatTime12(from).let { if (sameHalf) it.substringBeforeLast(' ') else it }
        return "$first – ${TimeFormat.formatTime12(to)}"
    }

    /** Period running at [now] (start inclusive, end exclusive), or null between/after periods. */
    fun currentPeriodIndex(rows: List<ScheduleRow>, now: LocalTime): Int? = rows.firstOrNull { row ->
        val start = row.startTime?.let(TimeFormat::parseTime) ?: return@firstOrNull false
        val end = row.endTime?.let(TimeFormat::parseTime) ?: return@firstOrNull false
        !now.isBefore(start) && now.isBefore(end)
    }?.periodIndex
}
