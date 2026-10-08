package com.schoolapp.feature.timetable

import androidx.compose.runtime.Immutable
import java.time.LocalDate

/** What a selected day shows. */
enum class DayStatus { LESSONS, FREE_DAY, HOLIDAY, NO_SCHOOL }

/** One day of the shown week: its date, timeline rows and, when the school is closed, why. */
@Immutable
data class DayPlan(
    val day: Int,
    val date: LocalDate?,
    val rows: List<ScheduleRow>,
    val holiday: String? = null,
    val isWorkingDay: Boolean = true,
) {
    val lessonCount: Int get() = rows.count { it.isLesson }

    val status: DayStatus get() = when {
        holiday != null && lessonCount == 0 -> DayStatus.HOLIDAY
        !isWorkingDay && lessonCount == 0 -> DayStatus.NO_SCHOOL
        lessonCount == 0 -> DayStatus.FREE_DAY
        else -> DayStatus.LESSONS
    }
}
