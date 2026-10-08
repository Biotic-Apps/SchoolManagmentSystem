package com.schoolapp.feature.timetable.substitutions

import com.schoolapp.core.model.timetable.BellSchedule
import com.schoolapp.core.model.timetable.Period
import com.schoolapp.core.model.timetable.TimetableOverride
import com.schoolapp.feature.timetable.ScheduleBuilder
import java.time.LocalDate

/** Turns overrides into list rows and the bell schedule into the form's period choices. */
internal object SubstitutionRows {

    fun items(overrides: List<TimetableOverride>, lookups: SubstitutionLookups): List<SubstitutionItem> = overrides.map { o ->
        val period = periodsOn(lookups.schedule, o.date).firstOrNull { it.index == o.periodIndex }
        SubstitutionItem(
            id = o.id,
            classLabel = classLabel(o, lookups),
            periodIndex = o.periodIndex,
            periodNumber = period?.number,
            timeRange = period?.let { ScheduleBuilder.timeRange(it.startTime, it.endTime) }?.takeIf { it.isNotBlank() },
            substitute = o.substituteName ?: lookups.teachers.firstOrNull { it.id == o.substituteStaffId }?.label,
            originalTeacher = o.originalTeacherName,
            reason = o.reason,
        )
    }

    /** Teaching periods (no breaks) of [date]'s weekday, in order. */
    fun choices(schedule: BellSchedule?, date: String): List<PeriodChoice> = periodsOn(schedule, date)
        .filterNot { it.isBreak }
        .sortedBy { it.index }
        .map { PeriodChoice(it.index, it.number, ScheduleBuilder.timeRange(it.startTime, it.endTime)) }

    private fun classLabel(o: TimetableOverride, lookups: SubstitutionLookups): String? {
        if (o.className != null && o.sectionName != null) return "${o.className} · ${o.sectionName}"
        return lookups.sections.firstOrNull { it.id == o.sectionId }?.label ?: o.sectionName
    }

    private fun periodsOn(schedule: BellSchedule?, date: String): List<Period> {
        if (schedule == null) return emptyList()
        val day = runCatching { LocalDate.parse(date).dayOfWeek.value }.getOrNull() ?: return schedule.default
        return schedule.periodsFor(day)
    }
}
