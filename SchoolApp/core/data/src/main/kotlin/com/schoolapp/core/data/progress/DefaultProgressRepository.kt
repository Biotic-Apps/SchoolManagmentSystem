package com.schoolapp.core.data.progress

import com.schoolapp.core.common.result.AppResult
import com.schoolapp.core.common.result.map
import com.schoolapp.core.data.common.approvalId
import com.schoolapp.core.data.common.isPendingReview
import com.schoolapp.core.model.progress.HomeworkTick
import com.schoolapp.core.model.progress.ProgressNote
import com.schoolapp.core.model.progress.ProgressNoteInput
import com.schoolapp.core.model.progress.ProgressNoteOutcome
import com.schoolapp.core.network.ApiCaller
import com.schoolapp.core.network.api.ProgressApi
import com.schoolapp.core.network.dto.progress.HomeworkEntryDto
import com.schoolapp.core.network.dto.progress.HomeworkStatusBodyDto
import com.schoolapp.core.network.dto.progress.ProgressNoteBodyDto
import com.schoolapp.core.network.dto.progress.ProgressNoteDto
import kotlinx.serialization.json.Json
import javax.inject.Inject
import javax.inject.Singleton

@Singleton
class DefaultProgressRepository @Inject constructor(
    private val api: ProgressApi,
    private val apiCaller: ApiCaller,
    private val json: Json,
) : ProgressRepository {

    override suspend fun notes(studentId: String): AppResult<List<ProgressNote>> =
        apiCaller.call { api.notes(studentId).data.map { it.toModel(studentId) }.sortedByDescending { it.createdAt.orEmpty() } }

    override suspend fun addNote(studentId: String, input: ProgressNoteInput): AppResult<ProgressNoteOutcome> =
        apiCaller.call {
            api.addNote(studentId, ProgressNoteBodyDto(input.category.name, input.note.trim(), input.visibleToParent)).data
        }.map { body ->
            if (body.isPendingReview() && !body.containsKey("id")) {
                ProgressNoteOutcome.PendingReview(body.approvalId())
            } else {
                ProgressNoteOutcome.Saved(json.decodeFromJsonElement(ProgressNoteDto.serializer(), body).toModel(studentId))
            }
        }

    override suspend fun saveHomeworkStatus(diaryId: String, ticks: List<HomeworkTick>): AppResult<Unit> =
        apiCaller.call {
            api.homeworkStatus(diaryId, HomeworkStatusBodyDto(ticks.map { HomeworkEntryDto(it.studentId, it.status.name) }))
            Unit
        }
}
