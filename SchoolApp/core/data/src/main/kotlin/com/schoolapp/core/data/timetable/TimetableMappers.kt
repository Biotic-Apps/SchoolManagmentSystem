package com.schoolapp.core.data.timetable

import com.schoolapp.core.model.timetable.Period
import com.schoolapp.core.model.timetable.SectionTimetable
import com.schoolapp.core.model.timetable.TeacherSlot
import com.schoolapp.core.model.timetable.TimetableSlot
import com.schoolapp.core.model.timetable.TimetableState
import com.schoolapp.core.network.dto.timetable.PeriodDto
import com.schoolapp.core.network.dto.timetable.SlotDto
import com.schoolapp.core.network.dto.timetable.TeacherSlotDto
import com.schoolapp.core.network.dto.timetable.TimetableDto

internal fun TeacherSlotDto.toModel() = TeacherSlot(
    date = date,
    day = day,
    periodIndex = periodIndex,
    startTime = startTime,
    endTime = endTime,
    sectionName = section?.name,
    className = section?.className,
    subjectName = subject?.name,
    staffName = staff?.name,
    roomName = room?.name,
    isSubstitute = isSubstitute,
    periodNumber = periodNumber,
)

internal fun TimetableDto.toModel() = SectionTimetable(
    sectionId = sectionId,
    status = status,
    version = version,
    publishedAt = publishedAt,
    slots = slots.map { it.toModel() },
    periods = periods.toSchedule(),
    state = TimetableState.parse(state) ?: legacyState(),
    dayPeriods = dayPeriods.toDaySchedules(),
    canEdit = canEdit,
)

internal fun Map<String, List<PeriodDto>>.toDaySchedules(): Map<Int, List<Period>> =
    mapNotNull { (day, rows) -> day.toIntOrNull()?.let { it to rows.toSchedule() } }.toMap()

/** Older servers send no `state`: they answered "DRAFT · v0" even when nothing was ever saved. */
private fun TimetableDto.legacyState(): TimetableState = when (status) {
    "PUBLISHED" -> TimetableState.PUBLISHED
    "DRAFT_REVISION" -> TimetableState.PUBLISHED_WITH_CHANGES
    "DRAFT" -> if (slots.isEmpty()) TimetableState.EMPTY else TimetableState.DRAFT
    else -> TimetableState.EMPTY
}

/** Sorted by index; teaching rows get their "Period N" number from the API or, if absent, by counting. */
internal fun List<PeriodDto>.toSchedule(): List<Period> {
    var teaching = 0
    return sortedBy { it.index }.map { dto ->
        val number = if (dto.isBreak) null else dto.number ?: (teaching + 1)
        if (!dto.isBreak) teaching++
        Period(dto.index, dto.startTime, dto.endTime, dto.isBreak, dto.label.takeIf { dto.isBreak }, number)
    }
}

internal fun SlotDto.toModel() = TimetableSlot(day, periodIndex, subject?.name, staff?.name, room?.name)
