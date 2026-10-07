package com.schoolapp.demo

import com.schoolapp.core.common.result.AppResult
import com.schoolapp.core.data.progress.DefaultProgressRepository
import com.schoolapp.core.data.progress.ProgressRepository
import com.schoolapp.core.model.RoleKey
import com.schoolapp.core.model.progress.HomeworkCompletionItem
import com.schoolapp.core.model.progress.HomeworkTick
import com.schoolapp.core.model.progress.ProgressNote
import com.schoolapp.core.model.progress.ProgressNoteInput
import com.schoolapp.core.model.progress.ProgressNoteOutcome
import kotlinx.coroutines.flow.update
import javax.inject.Inject
import javax.inject.Singleton

@Singleton
class DemoAwareProgressRepository @Inject constructor(
    private val real: DefaultProgressRepository,
    private val auth: DemoAwareAuthRepository,
) : ProgressRepository {

    override suspend fun notes(studentId: String): AppResult<List<ProgressNote>> {
        if (!auth.isDemoActive) return real.notes(studentId)
        val parent = auth.demoSession.value?.activeRole == RoleKey.PARENT
        val notes = DemoProgressData.notes.value
            .filter { it.studentId == studentId && (!parent || it.visibleToParent) }
            .sortedByDescending { it.createdAt.orEmpty() }
        return AppResult.Success(notes)
    }

    override suspend fun addNote(studentId: String, input: ProgressNoteInput): AppResult<ProgressNoteOutcome> {
        if (!auth.isDemoActive) return real.addNote(studentId, input)
        val note = ProgressNote(
            id = "demo-pn-${System.currentTimeMillis()}",
            studentId = studentId,
            category = input.category,
            note = input.note.trim(),
            visibleToParent = input.visibleToParent,
            author = DemoActors.forRole(auth.demoSession.value?.activeRole),
            createdAt = DemoDates.isoNow(),
        )
        DemoProgressData.notes.update { listOf(note) + it }
        return AppResult.Success(ProgressNoteOutcome.Saved(note))
    }

    override suspend fun saveHomeworkStatus(diaryId: String, ticks: List<HomeworkTick>): AppResult<Unit> {
        if (!auth.isDemoActive) return real.saveHomeworkStatus(diaryId, ticks)
        DemoProgressData.homeworkTicks.update { saved ->
            val merged = saved[diaryId].orEmpty().filterNot { old -> ticks.any { it.studentId == old.studentId } } + ticks
            saved + (diaryId to merged)
        }
        return AppResult.Success(Unit)
    }

    override suspend fun homeworkCompletion(studentId: String, from: String?, to: String?): AppResult<List<HomeworkCompletionItem>> =
        if (auth.isDemoActive) AppResult.Success(DemoHomeworkCompletionData.forChild(studentId)) else real.homeworkCompletion(studentId, from, to)
}
