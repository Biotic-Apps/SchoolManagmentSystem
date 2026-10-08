package com.schoolapp.core.model.timetable

import com.schoolapp.core.model.academics.NamedRef

/**
 * `GET /timetables/:sectionId/builder`: the section's draft week plus what the lesson sheet needs
 * (its subjects with weekly targets, rooms, who is busy elsewhere, live conflicts).
 */
data class TimetableBuilder(
    val draft: TimetableDraft,
    val sectionId: String,
    val sectionName: String,
    val sectionGroup: String?,
    val className: String,
    val branchId: String,
    val lessons: List<BuilderLesson>,
    val rooms: List<NamedRef>,
    val busy: List<BusyEntry>,
    val conflicts: List<Conflict>,
)

/** Draft view of a section timetable with the server's publish verdict. */
data class TimetableDraft(
    val sessionId: String?,
    val state: TimetableState,
    val version: Int,
    val publishedAt: String?,
    val canEdit: Boolean,
    val canPublish: Boolean,
    val publishBlockedReason: String?,
    val slots: List<DraftSlot>,
    val periods: List<Period>,
    val dayPeriods: Map<Int, List<Period>>,
    val workingDays: List<Int>,
) {
    fun periodsFor(day: Int): List<Period> = dayPeriods[day]?.takeIf { it.isNotEmpty() } ?: periods

    fun slotAt(day: Int, periodIndex: Int): DraftSlot? = slots.firstOrNull { it.day == day && it.periodIndex == periodIndex }
}

data class DraftSlot(
    val day: Int,
    val periodIndex: Int,
    val subject: NamedRef,
    val staff: NamedRef,
    val room: NamedRef?,
)

/** One subject of the section: weekly target, lessons placed so far and the allocated teacher. */
data class BuilderLesson(
    val subject: NamedRef,
    val periodsPerWeek: Int?,
    val placed: Int,
    val teacher: NamedRef?,
)

/** Another section's lesson at that time: [staffId] or [roomId] is taken. */
data class BusyEntry(
    val staffId: String?,
    val roomId: String?,
    val day: Int,
    val periodIndex: Int,
    val sectionName: String,
    val published: Boolean,
)

enum class ConflictSeverity { ERROR, WARNING }

/** A clash or rule break; [day]/[periodIndex] are 0 for week-level warnings (weekly periods short). */
data class Conflict(
    val type: String,
    val severity: ConflictSeverity,
    val day: Int,
    val periodIndex: Int,
    val message: String,
)

/** Body of `PUT /timetables/:sectionId/slots/:day/:periodIndex`. */
data class LessonInput(val subjectId: String, val staffId: String, val roomId: String?, val allocate: Boolean)

/** Server answer for one saved or removed lesson. */
data class LessonSaveResult(
    val conflicts: List<Conflict>,
    val subjectId: String?,
    val placed: Int?,
    val state: TimetableState,
    val canPublish: Boolean,
    val publishBlockedReason: String?,
    val allocated: Boolean,
)
