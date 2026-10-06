package com.schoolapp.core.data.timetable

import com.schoolapp.core.model.timetable.Period
import com.schoolapp.core.model.timetable.SectionTimetable
import com.schoolapp.core.model.timetable.TeacherSlot
import com.schoolapp.core.model.timetable.TimetableSlot
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
)

internal fun TimetableDto.toModel() = SectionTimetable(
    sectionId = sectionId,
    status = status,
    version = version,
    publishedAt = publishedAt,
    slots = slots.map { it.toModel() },
    periods = periods.map { it.toModel() }.sortedBy { it.index },
)

internal fun SlotDto.toModel() = TimetableSlot(day, periodIndex, subject?.name, staff?.name, room?.name)

internal fun PeriodDto.toModel() = Period(index, startTime, endTime, isBreak, label)
