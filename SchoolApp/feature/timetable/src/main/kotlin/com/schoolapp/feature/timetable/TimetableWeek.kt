package com.schoolapp.feature.timetable

import com.schoolapp.core.model.timetable.TimetableState

/** Whole-screen outcome before any day is picked. */
enum class TimetableStatus {
    CONTENT,
    /** Viewers: nothing published for them yet. */
    NOT_PUBLISHED,
    /** Teacher/helper without any class or subject assignment. */
    NOT_ASSIGNED,
    /** Editors: this section has no timetable at all yet. */
    NOT_CREATED,
    /** Section pickers with no section to pick. */
    NO_SECTIONS,
}

/** A loaded week plus how to present it. */
internal data class TimetableWeek(
    val status: TimetableStatus,
    val days: List<DayPlan> = emptyList(),
    val sectionState: TimetableState? = null,
    val sectionVersion: Int? = null,
    /** Class teacher looking at their own section's unpublished draft. */
    val draftNote: Boolean = false,
    /** The caller may edit this section's draft (class teacher of the section). */
    val sectionEditable: Boolean = false,
)
