package com.schoolapp.feature.timetable.builder

import androidx.compose.runtime.Composable
import androidx.compose.ui.res.stringResource
import com.schoolapp.core.common.time.TimeFormat
import com.schoolapp.core.designsystem.component.PickerOption
import com.schoolapp.core.model.academics.TeachingStaff
import com.schoolapp.core.model.timetable.BuilderLesson
import com.schoolapp.core.model.timetable.BusyEntry
import com.schoolapp.core.model.timetable.Period
import com.schoolapp.core.model.timetable.TimetableBuilder
import com.schoolapp.feature.timetable.R

/** "2 left", "6/6 done", "7/6, over" or "4 placed" when the subject has no weekly target. */
@Composable
internal fun lessonHint(lesson: BuilderLesson): String {
    val target = lesson.periodsPerWeek ?: return stringResource(R.string.tt_placed, lesson.placed)
    val left = target - lesson.placed
    return when {
        left > 0 -> stringResource(R.string.tt_left, left)
        left == 0 -> stringResource(R.string.tt_done, target, target)
        else -> stringResource(R.string.tt_over, lesson.placed, target)
    }
}

@Composable
internal fun subjectOptions(lessons: List<BuilderLesson>): List<PickerOption> =
    lessons.map { PickerOption(it.subject.id, it.subject.name, lessonHint(it)) }

/**
 * The subject's teacher first ("teaches English here"), then free teachers, then busy ones ("busy: Class 8 B",
 * still selectable); each with their load. Without the branch list, the section's allocated teachers are offered.
 */
@Composable
internal fun staffOptions(builder: TimetableBuilder, staff: List<TeachingStaff>, lesson: BuilderLesson?, busyNow: List<BusyEntry>): List<PickerOption> {
    val people = staff.map { it.id to it.name }.ifEmpty {
        builder.lessons.mapNotNull { it.teacher }.distinctBy { it.id }.map { it.id to it.name }
    }
    val load = staff.associate { it.id to stringResource(R.string.tt_load, it.placedPeriods, it.allocatedPeriods) }
    val teaches = lesson?.teacher?.id
    val here = lesson?.let { stringResource(R.string.tt_teaches_here, it.subject.name) }
    val busyLabel = busyNow.filter { it.staffId != null }.associate { it.staffId!! to it.sectionName }
    val busyTexts = busyLabel.mapValues { (_, section) -> stringResource(R.string.tt_busy_in, section) }
    fun rank(id: String) = when {
        id == teaches -> 0
        id in busyLabel -> 2
        else -> 1
    }
    return people.sortedWith(compareBy({ rank(it.first) }, { it.second.lowercase() })).map { (id, name) ->
        val tag = if (id == teaches) here else busyTexts[id]
        PickerOption(id, name, listOfNotNull(tag, load[id]).joinToString(" · ").ifBlank { null }, muted = id in busyLabel)
    }
}

/** "8:00 – 8:40 AM" style range in 12-hour time. */
internal fun timeRange(period: Period): String =
    "${TimeFormat.formatTime12(period.startTime)} – ${TimeFormat.formatTime12(period.endTime)}"
