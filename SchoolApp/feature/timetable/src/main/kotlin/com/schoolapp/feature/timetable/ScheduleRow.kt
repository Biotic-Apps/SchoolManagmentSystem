package com.schoolapp.feature.timetable

import androidx.compose.runtime.Immutable
import com.schoolapp.core.common.time.TimeFormat
import com.schoolapp.core.model.timetable.Period
import com.schoolapp.core.model.timetable.SectionTimetable
import com.schoolapp.core.model.timetable.TeacherSlot
import com.schoolapp.core.model.timetable.TimetableSlot
import java.time.LocalTime

/** One period on a day, ready to render; [timeRange] is already 12-hour ("8:40 AM – 9:20 AM"). */
@Immutable
data class ScheduleRow(
    val day: Int,
    val periodIndex: Int,
    val startTime: String?,
    val endTime: String?,
    val timeRange: String,
    val title: String,
    val subtitle: String?,
    val room: String?,
    val isSubstitute: Boolean = false,
    val isBreak: Boolean = false,
)

internal object ScheduleBuilder {

    fun fromSlots(slots: List<TeacherSlot>, showTeacher: Boolean): List<ScheduleRow> = slots.map { slot ->
        val section = listOfNotNull(slot.className, slot.sectionName).joinToString(" - ").ifBlank { null }
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
        )
    }.sortedWith(compareBy({ it.day }, { it.periodIndex }))

    /** Section view (break rows keep a blank title when unlabelled): every bell period of each working day, breaks included, filled from the slots. */
    fun fromTimetable(timetable: SectionTimetable): List<ScheduleRow> {
        val days = timetable.slots.map { it.day }.distinct().sorted()
        val bySlot = timetable.slots.associateBy { it.day to it.periodIndex }
        return days.flatMap { day ->
            timetable.periods.mapNotNull { period -> rowFor(day, period, bySlot[day to period.index]) }
        }
    }

    private fun rowFor(day: Int, period: Period, slot: TimetableSlot?): ScheduleRow? {
        if (!period.isBreak && slot == null) return null
        return ScheduleRow(
            day = day,
            periodIndex = period.index,
            startTime = period.startTime,
            endTime = period.endTime,
            timeRange = timeRange(period.startTime, period.endTime),
            title = if (period.isBreak) period.label.orEmpty() else slot?.subjectName.orEmpty(),
            subtitle = slot?.staffName,
            room = slot?.roomName,
            isBreak = period.isBreak,
        )
    }

    fun timeRange(start: String?, end: String?): String =
        listOfNotNull(start?.let(TimeFormat::formatTime12), end?.let(TimeFormat::formatTime12)).joinToString(" – ")

    /** Period running at [now] (start inclusive, end exclusive), or null between/after periods. */
    fun currentPeriodIndex(rows: List<ScheduleRow>, now: LocalTime): Int? = rows.firstOrNull { row ->
        val start = row.startTime?.let(TimeFormat::parseTime) ?: return@firstOrNull false
        val end = row.endTime?.let(TimeFormat::parseTime) ?: return@firstOrNull false
        !now.isBefore(start) && now.isBefore(end)
    }?.periodIndex
}
