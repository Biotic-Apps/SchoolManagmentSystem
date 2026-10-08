package com.schoolapp.feature.timetable

import androidx.compose.runtime.Immutable

/** What a timeline row stands for: a placed lesson, a break, or an empty (free) teaching period. */
enum class RowKind { LESSON, BREAK, FREE }

/**
 * One period on a day, ready to render; [timeRange] is already 12-hour ("9:20 – 10:00 AM").
 * [periodNumber] is "Period N" among the day's teaching periods (null for breaks or when unknown);
 * [title] is the subject (or a break's label) and may be blank.
 */
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
    val kind: RowKind = RowKind.LESSON,
    val periodNumber: Int? = null,
    /** Teacher's name where known (child / section views); [subtitle] already shows it there. */
    val teacher: String? = null,
    /** "Class 5 · A" where known (teacher's week). */
    val section: String? = null,
) {
    val isBreak: Boolean get() = kind == RowKind.BREAK
    val isLesson: Boolean get() = kind == RowKind.LESSON
    val key: String get() = "$day-$periodIndex-${kind.name}"
}

/** Whether a row is running now or is the next lesson of today. */
enum class RowMarker { NOW, NEXT }
