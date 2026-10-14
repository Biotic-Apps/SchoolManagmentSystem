package com.schoolapp.core.data.diary

import com.schoolapp.core.common.dispatcher.IoDispatcher
import com.schoolapp.core.common.result.AppError
import com.schoolapp.core.common.result.AppResult
import com.schoolapp.core.common.result.map
import com.schoolapp.core.data.common.clean
import com.schoolapp.core.data.common.isPendingReview
import com.schoolapp.core.data.common.approvalId
import com.schoolapp.core.data.common.string
import com.schoolapp.core.database.outbox.OutboxDao
import com.schoolapp.core.database.outbox.OutboxEntity
import com.schoolapp.core.model.diary.DiaryEntry
import com.schoolapp.core.model.diary.DiaryInput
import com.schoolapp.core.model.diary.DiaryOutcome
import com.schoolapp.core.model.diary.MissingDiary
import com.schoolapp.core.network.ApiCaller
import com.schoolapp.core.network.api.DiaryApi
import com.schoolapp.core.network.dto.common.CommentBodyDto
import com.schoolapp.core.network.dto.diary.DiaryBodyDto
import com.schoolapp.core.sync.OutboxProcessor
import com.schoolapp.core.sync.SyncScheduler
import kotlinx.coroutines.CoroutineDispatcher
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.distinctUntilChanged
import kotlinx.coroutines.flow.flowOn
import kotlinx.coroutines.flow.map
import kotlinx.coroutines.withContext
import kotlinx.serialization.json.Json
import java.util.UUID
import javax.inject.Inject
import javax.inject.Singleton

@Singleton
class DefaultDiaryRepository @Inject constructor(
    private val api: DiaryApi,
    private val apiCaller: ApiCaller,
    private val outboxDao: OutboxDao,
    private val syncScheduler: SyncScheduler,
    private val json: Json,
    @IoDispatcher private val io: CoroutineDispatcher,
) : DiaryRepository {

    override val queuedSlots: Flow<Set<String>> = outboxDao.observeByTypePrefix(OUTBOX_PREFIX)
        .map { rows -> rows.mapNotNull { it.entityKey }.toSet() }
        .distinctUntilChanged()
        .flowOn(io)

    override suspend fun entries(sectionId: String?, date: String?, from: String?, to: String?): AppResult<List<DiaryEntry>> =
        apiCaller.call {
            api.entries(sectionId, date, from, to).data.map { it.toModel() }
                .sortedWith(compareByDescending<DiaryEntry> { it.date }.thenBy { it.subjectName })
        }

    override suspend fun saveDraft(input: DiaryInput, clientRequestId: String): AppResult<DiaryOutcome> {
        val body = input.toBody(clientRequestId)
        val result = apiCaller.call { api.save(body, clientRequestId).data }
        if (result is AppResult.Failure && result.error == AppError.Network) {
            enqueueSave(input, body)
            syncScheduler.requestSync()
            return AppResult.Success(DiaryOutcome.Queued)
        }
        return result.map { it.toDiaryOutcome(json) }
    }

    override suspend fun publish(input: DiaryInput, entryId: String?, clientRequestId: String): AppResult<DiaryOutcome> {
        val body = input.toBody(clientRequestId)
        val publishKey = publishRequestId(clientRequestId)
        val saved = when (val result = apiCaller.call { api.save(body, clientRequestId).data }) {
            is AppResult.Success -> result.data
            is AppResult.Failure -> {
                if (result.error != AppError.Network) return result
                enqueueSave(input, body)
                enqueuePublish(input, entryId ?: OutboxProcessor.refPlaceholder(clientRequestId), publishKey)
                syncScheduler.requestSync()
                return AppResult.Success(DiaryOutcome.Queued)
            }
        }
        if (saved.isPendingReview() && !saved.containsKey("id")) return AppResult.Success(DiaryOutcome.PendingReview(saved.approvalId()))
        val id = saved.string("id") ?: entryId ?: return AppResult.Failure(AppError.Unknown())
        val published = apiCaller.call { api.publish(id, publishKey).data }
        if (published is AppResult.Failure && published.error == AppError.Network) {
            enqueuePublish(input, id, publishKey)
            syncScheduler.requestSync()
            return AppResult.Success(DiaryOutcome.Queued)
        }
        return published.map { it.toDiaryOutcome(json) }
    }

    override suspend fun moderationQueue(branchId: String?): AppResult<List<DiaryEntry>> =
        apiCaller.call {
            api.entries(branchId = branchId, status = STATUS_SUBMITTED).data.map { it.toModel() }
                .filter { it.status.name == STATUS_SUBMITTED }
                .sortedWith(compareBy<DiaryEntry> { it.date }.thenBy { it.className }.thenBy { it.sectionName })
        }

    override suspend fun publishEntry(id: String): AppResult<DiaryOutcome> =
        apiCaller.call { api.publish(id, UUID.randomUUID().toString()).data }.map { it.toDiaryOutcome(json) }

    override suspend fun returnEntry(id: String, comment: String): AppResult<DiaryEntry> =
        apiCaller.call { api.returnEntry(id, CommentBodyDto(comment.clean())).data.toModel() }

    override suspend fun missing(branchId: String?, date: String): AppResult<List<MissingDiary>> =
        apiCaller.call {
            api.missing(branchId, date).data.map { it.toModel() }
                .sortedWith(compareBy({ it.className }, { it.sectionName }, { it.subjectName }))
        }

    private suspend fun enqueueSave(input: DiaryInput, body: DiaryBodyDto) = insert(
        OutboxEntity(
            type = OUTBOX_SAVE,
            method = "PUT",
            path = "diary",
            payloadJson = json.encodeToString(DiaryBodyDto.serializer(), body),
            clientRequestId = body.clientRequestId.orEmpty(),
            createdAt = System.currentTimeMillis(),
            entityKey = input.slotKey,
        ),
    )

    /** [idOrRef] is the server id, or a placeholder resolved from the queued save when it is sent. */
    private suspend fun enqueuePublish(input: DiaryInput, idOrRef: String, requestId: String) = insert(
        OutboxEntity(
            type = OUTBOX_PUBLISH,
            method = "POST",
            path = "diary/$idOrRef/publish",
            payloadJson = "{}",
            clientRequestId = requestId,
            createdAt = System.currentTimeMillis(),
            entityKey = input.slotKey,
        ),
    )

    private suspend fun insert(entry: OutboxEntity) {
        withContext(io) { outboxDao.insert(entry) }
    }

    internal companion object {
        const val OUTBOX_PREFIX = "DIARY_"
        const val STATUS_SUBMITTED = "SUBMITTED"
        const val OUTBOX_SAVE = "DIARY_SAVE"
        const val OUTBOX_PUBLISH = "DIARY_PUBLISH"

        /** The publish call gets its own idempotency key derived from the editor's clientRequestId. */
        fun publishRequestId(clientRequestId: String) = "$clientRequestId-publish"
    }
}
