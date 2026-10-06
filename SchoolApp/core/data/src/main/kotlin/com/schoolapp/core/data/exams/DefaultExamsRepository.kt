package com.schoolapp.core.data.exams

import com.schoolapp.core.common.dispatcher.IoDispatcher
import com.schoolapp.core.common.result.AppError
import com.schoolapp.core.common.result.AppResult
import com.schoolapp.core.common.result.map
import com.schoolapp.core.data.common.approvalId
import com.schoolapp.core.data.common.clean
import com.schoolapp.core.data.common.isPendingReview
import com.schoolapp.core.database.outbox.OutboxDao
import com.schoolapp.core.database.outbox.OutboxEntity
import com.schoolapp.core.database.outbox.OutboxStatus
import com.schoolapp.core.model.exams.ChildResults
import com.schoolapp.core.model.exams.Exam
import com.schoolapp.core.model.exams.ExamStatus
import com.schoolapp.core.model.exams.LoadedMarkSheet
import com.schoolapp.core.model.exams.MarkEntry
import com.schoolapp.core.model.exams.MarkSheet
import com.schoolapp.core.model.exams.MarkSheetOutcome
import com.schoolapp.core.model.exams.MarkSheetSyncState
import com.schoolapp.core.model.exams.ReportCard
import com.schoolapp.core.network.ApiCaller
import com.schoolapp.core.network.api.ExamsApi
import com.schoolapp.core.network.dto.common.CommentBodyDto
import com.schoolapp.core.network.dto.exams.MarkSheetBodyDto
import com.schoolapp.core.network.dto.exams.MarkSheetDto
import com.schoolapp.core.sync.SyncScheduler
import kotlinx.coroutines.CoroutineDispatcher
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.distinctUntilChanged
import kotlinx.coroutines.flow.first
import kotlinx.coroutines.flow.flowOn
import kotlinx.coroutines.flow.map
import kotlinx.coroutines.withContext
import kotlinx.serialization.json.Json
import java.util.concurrent.ConcurrentHashMap
import javax.inject.Inject
import javax.inject.Singleton

/**
 * Mark sheets with an offline queue: a save made without network goes to the outbox (Room) with its
 * clientRequestId and is overlaid on the sheet until sent. The last server copy of each opened sheet is
 * kept in memory so it can be reopened while offline in the same app session.
 */
@Singleton
class DefaultExamsRepository @Inject constructor(
    private val api: ExamsApi,
    private val apiCaller: ApiCaller,
    private val outboxDao: OutboxDao,
    private val syncScheduler: SyncScheduler,
    private val json: Json,
    @IoDispatcher private val io: CoroutineDispatcher,
) : ExamsRepository {

    private val lastServerCopy = ConcurrentHashMap<String, MarkSheet>()

    override suspend fun exams(status: ExamStatus?, branchId: String?): AppResult<List<Exam>> =
        apiCaller.call { api.exams(branchId = branchId, status = status?.name).data.map { it.toModel() } }

    override suspend fun markSheets(examId: String): AppResult<List<MarkSheet>> =
        apiCaller.call { api.markSheets(examId).data.map { it.toModel() }.sortedForList() }

    override suspend fun myMarkSheets(): AppResult<List<MarkSheet>> {
        val exams = when (val result = exams(ExamStatus.MARKS_OPEN)) {
            is AppResult.Success -> result.data
            is AppResult.Failure -> return result
        }
        return apiCaller.call {
            exams.flatMap { exam -> api.markSheets(exam.id).data.map { it.toModel(exam.name) } }.sortedForList()
        }
    }

    override suspend fun markSheet(id: String): AppResult<LoadedMarkSheet> {
        val queued = queuedEntries(id)
        return when (val result = apiCaller.call { api.markSheet(id).data.toModel() }) {
            is AppResult.Success -> {
                lastServerCopy[id] = result.data
                val local = queued.takeIf { result.data.status.isEditable }
                AppResult.Success(LoadedMarkSheet(local?.let(result.data::withEntries) ?: result.data, local))
            }
            is AppResult.Failure -> {
                val cached = lastServerCopy[id]
                if (result.error == AppError.Network && cached != null) {
                    AppResult.Success(LoadedMarkSheet(queued?.let(cached::withEntries) ?: cached, queued, offline = true))
                } else {
                    result
                }
            }
        }
    }

    override suspend fun saveMarks(sheetId: String, entries: List<MarkEntry>, clientRequestId: String): AppResult<MarkSheetOutcome> {
        val body = MarkSheetBodyDto(entries.map { it.toDto() }, clientRequestId)
        if (hasQueued(sheetId)) {
            // An earlier save is still waiting; queue behind it so the newer marks are applied last.
            enqueueSave(sheetId, body)
            syncScheduler.requestSync()
            return AppResult.Success(MarkSheetOutcome.Queued)
        }
        return when (val result = apiCaller.call { api.saveMarks(sheetId, body, clientRequestId).data }) {
            is AppResult.Success -> AppResult.Success(MarkSheetOutcome.Saved(cache(result.data)))
            is AppResult.Failure -> if (result.error == AppError.Network) {
                enqueueSave(sheetId, body)
                syncScheduler.requestSync()
                AppResult.Success(MarkSheetOutcome.Queued)
            } else {
                result
            }
        }
    }

    override suspend fun submit(sheetId: String, entries: List<MarkEntry>, clientRequestId: String): AppResult<MarkSheetOutcome> {
        val submitKey = submitRequestId(clientRequestId)
        when (val saved = saveMarks(sheetId, entries, clientRequestId)) {
            is AppResult.Failure -> return saved
            is AppResult.Success -> if (saved.data == MarkSheetOutcome.Queued) {
                enqueueSubmit(sheetId, submitKey)
                syncScheduler.requestSync()
                return saved
            }
        }
        val submitted = apiCaller.call { api.submit(sheetId, submitKey).data }
        if (submitted is AppResult.Failure && submitted.error == AppError.Network) {
            enqueueSubmit(sheetId, submitKey)
            syncScheduler.requestSync()
            return AppResult.Success(MarkSheetOutcome.Queued)
        }
        return submitted.map { body ->
            if (body.isPendingReview() && !body.containsKey("id")) {
                MarkSheetOutcome.PendingReview(body.approvalId())
            } else {
                MarkSheetOutcome.Saved(cache(json.decodeFromJsonElement(MarkSheetDto.serializer(), body)))
            }
        }
    }

    override fun syncState(sheetId: String): Flow<MarkSheetSyncState> =
        outboxDao.observeByEntityKey(sheetKey(sheetId))
            .map { rows ->
                when {
                    rows.any { it.status == OutboxStatus.NEEDS_ATTENTION } -> MarkSheetSyncState.NEEDS_ATTENTION
                    rows.isNotEmpty() -> MarkSheetSyncState.QUEUED
                    else -> MarkSheetSyncState.NONE
                }
            }
            .distinctUntilChanged()
            .flowOn(io)

    override suspend fun discardLocal(sheetId: String) = withContext(io) { outboxDao.deleteByEntityKey(sheetKey(sheetId)) }

    override suspend fun accept(id: String, comment: String?): AppResult<MarkSheet> =
        apiCaller.call { cache(api.accept(id, CommentBodyDto(comment.clean())).data) }

    override suspend fun returnSheet(id: String, comment: String): AppResult<MarkSheet> =
        apiCaller.call { cache(api.returnSheet(id, CommentBodyDto(comment.clean())).data) }

    override suspend fun childResults(studentId: String): AppResult<ChildResults> =
        apiCaller.call { api.studentResults(studentId).data.toChildResults(json) }

    override suspend fun reportCard(studentId: String, examId: String): AppResult<ReportCard> =
        apiCaller.call { api.reportCard(studentId, examId).data.toModel() }

    private fun cache(dto: MarkSheetDto): MarkSheet = dto.toModel(lastServerCopy[dto.id]?.examName).also { lastServerCopy[dto.id] = it }

    /** Rows of the newest queued save of the sheet, or null when nothing is queued. */
    private suspend fun queuedEntries(sheetId: String): List<MarkEntry>? = withContext(io) {
        outboxDao.observeByEntityKey(sheetKey(sheetId)).first()
            .lastOrNull { it.type == OUTBOX_SAVE }
            ?.let { runCatching { json.decodeFromString(MarkSheetBodyDto.serializer(), it.payloadJson) }.getOrNull() }
            ?.rows?.map { it.toEntry() }
    }

    private suspend fun hasQueued(sheetId: String): Boolean = withContext(io) {
        outboxDao.observeByEntityKey(sheetKey(sheetId)).first().any { it.status != OutboxStatus.NEEDS_ATTENTION }
    }

    private suspend fun enqueueSave(sheetId: String, body: MarkSheetBodyDto) = insert(
        OutboxEntity(
            type = OUTBOX_SAVE,
            method = "PUT",
            path = "mark-sheets/$sheetId",
            payloadJson = json.encodeToString(MarkSheetBodyDto.serializer(), body),
            clientRequestId = body.clientRequestId.orEmpty(),
            createdAt = System.currentTimeMillis(),
            entityKey = sheetKey(sheetId),
        ),
    )

    private suspend fun enqueueSubmit(sheetId: String, requestId: String) = insert(
        OutboxEntity(
            type = OUTBOX_SUBMIT,
            method = "POST",
            path = "mark-sheets/$sheetId/submit",
            payloadJson = "{}",
            clientRequestId = requestId,
            createdAt = System.currentTimeMillis(),
            entityKey = sheetKey(sheetId),
        ),
    )

    private suspend fun insert(entry: OutboxEntity) {
        withContext(io) { outboxDao.insert(entry) }
    }

    private fun List<MarkSheet>.sortedForList() =
        sortedWith(compareBy<MarkSheet>({ it.examName.orEmpty() }, { it.className }, { it.sectionName }, { it.subjectName }))

    internal companion object {
        const val OUTBOX_SAVE = "MARKS_SAVE"
        const val OUTBOX_SUBMIT = "MARKS_SUBMIT"

        fun sheetKey(sheetId: String) = "marksheet|$sheetId"

        fun submitRequestId(clientRequestId: String) = "$clientRequestId-submit"
    }
}
