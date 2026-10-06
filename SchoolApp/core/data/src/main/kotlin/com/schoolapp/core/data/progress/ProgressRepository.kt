package com.schoolapp.core.data.progress

import com.schoolapp.core.common.result.AppResult
import com.schoolapp.core.model.progress.HomeworkTick
import com.schoolapp.core.model.progress.ProgressNote
import com.schoolapp.core.model.progress.ProgressNoteInput
import com.schoolapp.core.model.progress.ProgressNoteOutcome

interface ProgressRepository {
    /** Newest first; parents get only notes visible to them (server-side). */
    suspend fun notes(studentId: String): AppResult<List<ProgressNote>>

    suspend fun addNote(studentId: String, input: ProgressNoteInput): AppResult<ProgressNoteOutcome>

    /** `PUT /diary/:id/homework-status`. */
    suspend fun saveHomeworkStatus(diaryId: String, ticks: List<HomeworkTick>): AppResult<Unit>
}
