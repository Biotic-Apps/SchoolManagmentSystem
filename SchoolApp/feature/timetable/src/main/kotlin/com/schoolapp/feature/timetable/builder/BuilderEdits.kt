package com.schoolapp.feature.timetable.builder

import com.schoolapp.core.model.timetable.BuilderLesson
import com.schoolapp.core.model.timetable.DraftSlot
import com.schoolapp.core.model.timetable.LessonSaveResult
import com.schoolapp.core.model.timetable.TimetableBuilder
import com.schoolapp.core.model.timetable.TimetableState

/** Optimistic and server-confirmed changes to one cell of the builder (same rules as the web's builder cache). */
internal object BuilderEdits {

    /** Puts (or clears) one cell right away: placed counts move, the cell's old conflicts go, the state badge moves on. */
    fun withSlot(builder: TimetableBuilder, day: Int, periodIndex: Int, slot: DraftSlot?): TimetableBuilder {
        val draft = builder.draft
        val previous = draft.slotAt(day, periodIndex)
        val slots = draft.slots.filterNot { it.day == day && it.periodIndex == periodIndex } + listOfNotNull(slot)
        val state = when {
            draft.state == TimetableState.PUBLISHED -> TimetableState.PUBLISHED_WITH_CHANGES
            draft.state == TimetableState.EMPTY && slot != null -> TimetableState.DRAFT
            else -> draft.state
        }
        return builder.copy(
            lessons = recount(builder.lessons, previous?.subject?.id, slot?.subject?.id),
            conflicts = builder.conflicts.filterNot { it.day == day && it.periodIndex == periodIndex },
            draft = draft.copy(slots = slots, state = state),
        )
    }

    /** Server answer for one cell: its conflicts, the subject's placed count and the publish verdict. */
    fun withResult(builder: TimetableBuilder, day: Int, periodIndex: Int, result: LessonSaveResult): TimetableBuilder {
        val lessons = if (result.subjectId != null && result.placed != null) {
            builder.lessons.map { if (it.subject.id == result.subjectId) it.copy(placed = result.placed!!) else it }
        } else {
            builder.lessons
        }
        val others = builder.conflicts.filterNot { it.day == day && it.periodIndex == periodIndex }
        return builder.copy(
            lessons = lessons,
            conflicts = others + result.conflicts,
            draft = builder.draft.copy(
                state = result.state,
                canPublish = result.canPublish,
                publishBlockedReason = result.publishBlockedReason,
            ),
        )
    }

    private fun recount(lessons: List<BuilderLesson>, removed: String?, added: String?): List<BuilderLesson> = lessons.map {
        val delta = (if (it.subject.id == added) 1 else 0) - (if (it.subject.id == removed) 1 else 0)
        if (delta == 0) it else it.copy(placed = (it.placed + delta).coerceAtLeast(0))
    }
}
