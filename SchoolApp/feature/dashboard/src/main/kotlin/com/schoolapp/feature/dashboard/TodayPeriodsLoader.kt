package com.schoolapp.feature.dashboard

import com.schoolapp.core.common.result.AppResult
import com.schoolapp.core.common.result.map
import com.schoolapp.core.common.time.AppClock
import com.schoolapp.core.common.time.TimeFormat
import com.schoolapp.core.data.timetable.TimetableRepository
import javax.inject.Inject

/** Today's slice of the teacher's week, with 12-hour times and the running period marked. */
class TodayPeriodsLoader @Inject constructor(
    private val repository: TimetableRepository,
    private val clock: AppClock,
) {
    suspend fun load(): AppResult<List<TodayPeriod>> {
        val now = clock.now()
        val today = now.dayOfWeek.value
        val time = now.toLocalTime()
        return repository.myWeek().map { slots ->
            slots.filter { it.day == today }.sortedBy { it.periodIndex }.map { slot ->
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
                )
            }
        }
    }
}
