package com.schoolapp.core.data.timetable

import com.schoolapp.core.data.academics.toNamedRef
import com.schoolapp.core.model.academics.NamedRef
import com.schoolapp.core.model.timetable.BellScheduleInput
import com.schoolapp.core.model.timetable.BuilderLesson
import com.schoolapp.core.model.timetable.BusyEntry
import com.schoolapp.core.model.timetable.Conflict
import com.schoolapp.core.model.timetable.ConflictSeverity
import com.schoolapp.core.model.timetable.DraftSlot
import com.schoolapp.core.model.timetable.LessonInput
import com.schoolapp.core.model.timetable.LessonSaveResult
import com.schoolapp.core.model.timetable.PeriodInput
import com.schoolapp.core.model.timetable.TimetableBuilder
import com.schoolapp.core.model.timetable.TimetableDraft
import com.schoolapp.core.model.timetable.TimetableState
import com.schoolapp.core.network.dto.timetable.BellScheduleRequest
import com.schoolapp.core.network.dto.timetable.CellResultDto
import com.schoolapp.core.network.dto.timetable.ConflictDto
import com.schoolapp.core.network.dto.timetable.DraftTimetableDto
import com.schoolapp.core.network.dto.timetable.LessonRequest
import com.schoolapp.core.network.dto.timetable.PeriodRequest
import com.schoolapp.core.network.dto.timetable.SlotDto
import com.schoolapp.core.network.dto.timetable.TimetableBuilderDto

internal fun TimetableBuilderDto.toModel() = TimetableBuilder(
    draft = timetable.toDraft(),
    sectionId = section.id,
    sectionName = section.name,
    sectionGroup = section.group?.takeIf { it.isNotBlank() },
    className = section.schoolClass?.name.orEmpty(),
    branchId = section.branchId,
    lessons = lessons.map { BuilderLesson(it.subject.toNamedRef() ?: NamedRef("", ""), it.periodsPerWeek, it.placed, it.teacher.toNamedRef()) }
        .filter { it.subject.id.isNotEmpty() },
    rooms = rooms.mapNotNull { it.toNamedRef() },
    busy = busy.map { BusyEntry(it.staffId, it.roomId, it.day, it.periodIndex, it.sectionName.orEmpty(), it.published) },
    conflicts = conflicts.map { it.toModel() },
)

private fun DraftTimetableDto.toDraft() = TimetableDraft(
    sessionId = sessionId,
    state = TimetableState.parse(state) ?: if (slots.isEmpty()) TimetableState.EMPTY else TimetableState.DRAFT,
    version = version,
    publishedAt = publishedAt,
    canEdit = canEdit,
    canPublish = canPublish,
    publishBlockedReason = publishBlockedReason,
    slots = slots.mapNotNull { it.toDraftSlot() },
    periods = periods.toSchedule(),
    dayPeriods = dayPeriods.toDaySchedules(),
    workingDays = workingDays.sorted(),
)

internal fun SlotDto.toDraftSlot(): DraftSlot? {
    val subject = subject.toNamedRef() ?: return null
    val staff = staff.toNamedRef() ?: return null
    return DraftSlot(day, periodIndex, subject, staff, room.toNamedRef())
}

/** Missing severity (older API) blocks publishing, like the web. */
internal fun ConflictDto.toModel() = Conflict(
    type = type,
    severity = if (severity == "warning") ConflictSeverity.WARNING else ConflictSeverity.ERROR,
    day = day,
    periodIndex = periodIndex,
    message = message,
)

internal fun CellResultDto.toModel() = LessonSaveResult(
    conflicts = conflicts.map { it.toModel() },
    subjectId = lesson?.subjectId,
    placed = lesson?.placed,
    state = TimetableState.parse(state) ?: TimetableState.DRAFT,
    canPublish = canPublish,
    publishBlockedReason = publishBlockedReason,
    allocated = allocated,
)

internal fun LessonInput.toRequest() = LessonRequest(subjectId, staffId, roomId, allocate)

internal fun BellScheduleInput.toRequest() = BellScheduleRequest(
    default = default.map { it.toRequest() },
    days = days.mapKeys { it.key.toString() }.mapValues { (_, rows) -> rows.map { it.toRequest() } },
    dropLessons = dropLessons.takeIf { it },
)

private fun PeriodInput.toRequest() = PeriodRequest(index, startTime, endTime, isBreak, label?.takeIf { isBreak })
