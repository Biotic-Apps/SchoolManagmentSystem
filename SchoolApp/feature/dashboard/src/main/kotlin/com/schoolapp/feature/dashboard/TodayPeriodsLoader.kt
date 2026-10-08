package com.schoolapp.feature.dashboard

import com.schoolapp.core.common.result.AppResult
import com.schoolapp.core.common.result.map
import com.schoolapp.core.common.time.AppClock
import com.schoolapp.core.common.time.TimeFormat
import com.schoolapp.core.data.timetable.TimetableRepository
import com.schoolapp.core.model.timetable.TeacherSlot
import java.time.LocalDateTime
import javax.inject.Inject

/** Today's slice of the teacher's week, with 12-hour times and the running period marked. */
class TodayPeriodsLoader @Inject constructor(
    private val repository: TimetableRepository,
    private val clock: AppClock,
) {
    suspend fun load(): AppResult<List<TodayPeriod>> {
        val now = clock.now()
        return repository.myWeek().map { slots -> todayPeriods(slots.filter { it.day == now.dayOfWeek.value }, now) }
    }

    /** Whether [sectionId]'s timetable is published; null when unknown (request failed). */
    suspend fun isPublished(sectionId: String): Boolean? =
        (repository.sectionTimetable(sectionId) as? AppResult.Success)?.data?.state?.isPublished
}

/** Maps slots already limited to today, sorted by period. */
internal fun todayPeriods(slots: List<TeacherSlot>, now: LocalDateTime): List<TodayPeriod> {
    val time = now.toLocalTime()
    val mapped = slots.sortedBy { it.periodIndex }.map { slot ->
        val start = slot.startTime?.let(TimeFormat::parseTime)
        val end = slot.endTime?.let(TimeFormat::parseTime)
        TodayPeriod(
            periodIndex = slot.periodIndex,
            timeRange = listOfNotNull(start, end).joinToString(" – ") { TimeFormat.formatTime12(it) },
            title = slot.subjectName.orEmpty(),
            subtitle = listOfNotNull(slot.className, slot.sectionName).joinToString(" - ").ifBlank { null }
                ?.let { section -> listOfNotNull(section, slot.roomName).joinToString(" · ") },
            isSubstitute = slot.isSubstitute,
            isCurrent = start != null && end != null && !time.isBefore(start) && time.isBefore(end),
            isPast = end != null && !time.isBefore(end),
        )
    }
    val next = mapped.indexOfFirst { !it.isCurrent && !it.isPast }
    return mapped.mapIndexed { index, period -> if (index == next) period.copy(isNext = true) else period }
}
