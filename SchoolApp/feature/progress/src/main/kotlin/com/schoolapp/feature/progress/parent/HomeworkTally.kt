package com.schoolapp.feature.progress.parent

import androidx.compose.runtime.Immutable
import com.schoolapp.core.model.progress.HomeworkCompletionItem
import com.schoolapp.core.model.progress.HomeworkStatus

/** Counts of the child's homework by the teacher's tick; [unchecked] = not ticked yet. */
@Immutable
data class HomeworkTally(val total: Int = 0, val done: Int = 0, val partial: Int = 0, val notDone: Int = 0, val unchecked: Int = 0) {
    companion object {
        fun of(items: List<HomeworkCompletionItem>): HomeworkTally {
            val byStatus = items.groupingBy { it.status }.eachCount()
            return HomeworkTally(
                total = items.size,
                done = byStatus[HomeworkStatus.DONE] ?: 0,
                partial = byStatus[HomeworkStatus.PARTIAL] ?: 0,
                notDone = byStatus[HomeworkStatus.NOT_DONE] ?: 0,
                unchecked = byStatus[null] ?: 0,
            )
        }
    }
}
