package com.schoolapp.core.data.syllabus

import com.schoolapp.core.common.dispatcher.IoDispatcher
import com.schoolapp.core.common.result.AppError
import com.schoolapp.core.common.result.AppResult
import com.schoolapp.core.common.result.map
import com.schoolapp.core.database.outbox.OutboxDao
import com.schoolapp.core.database.outbox.OutboxEntity
import com.schoolapp.core.model.syllabus.BookList
import com.schoolapp.core.model.syllabus.CoverageRow
import com.schoolapp.core.model.syllabus.ProgressOutcome
import com.schoolapp.core.model.syllabus.SyllabusPlan
import com.schoolapp.core.model.syllabus.TopicProgressUpdate
import com.schoolapp.core.network.ApiCaller
import com.schoolapp.core.network.api.SyllabusApi
import com.schoolapp.core.network.dto.syllabus.TopicProgressBodyDto
import com.schoolapp.core.sync.SyncScheduler
import kotlinx.coroutines.CoroutineDispatcher
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.distinctUntilChanged
import kotlinx.coroutines.flow.flowOn
import kotlinx.coroutines.flow.map
import kotlinx.coroutines.withContext
import kotlinx.serialization.json.Json
import javax.inject.Inject
import javax.inject.Singleton

@Singleton
class DefaultSyllabusRepository @Inject constructor(
    private val api: SyllabusApi,
    private val apiCaller: ApiCaller,
    private val outboxDao: OutboxDao,
    private val syncScheduler: SyncScheduler,
    private val json: Json,
    @IoDispatcher private val io: CoroutineDispatcher,
) : SyllabusRepository {

    override val queuedTopicIds: Flow<Set<String>> = outboxDao.observeByType(OUTBOX_TYPE)
        .map { rows -> rows.mapNotNull { topicIdFromPath(it.path) }.toSet() }
        .distinctUntilChanged()
        .flowOn(io)

    override suspend fun plans(sectionId: String?, subjectId: String?): AppResult<List<SyllabusPlan>> =
        apiCaller.call { api.plans(sectionId, subjectId).data.map { it.toModel() } }

    override suspend fun updateProgress(
        topicId: String,
        update: TopicProgressUpdate,
        clientRequestId: String,
    ): AppResult<ProgressOutcome> {
        val body = update.toBody()
        val result = apiCaller.call { api.updateProgress(topicId, body, clientRequestId).data }
        if (result is AppResult.Failure && result.error == AppError.Network) {
            enqueue(topicId, body, clientRequestId)
            return AppResult.Success(ProgressOutcome.Queued)
        }
        return result.map { it.toProgressOutcome() }
    }

    override suspend fun coverage(): AppResult<List<CoverageRow>> = apiCaller.call {
        api.coverage().data.map { it.toModel() }
            .sortedWith(compareBy({ it.className }, { it.sectionName }, { it.subjectName }))
    }

    override suspend fun bookLists(): AppResult<List<BookList>> =
        apiCaller.call { api.bookLists().data.map { it.toModel() } }

    private suspend fun enqueue(topicId: String, body: TopicProgressBodyDto, clientRequestId: String) {
        withContext(io) {
            outboxDao.insert(
                OutboxEntity(
                    type = OUTBOX_TYPE,
                    method = "POST",
                    path = progressPath(topicId),
                    payloadJson = json.encodeToString(TopicProgressBodyDto.serializer(), body),
                    clientRequestId = clientRequestId,
                    createdAt = System.currentTimeMillis(),
                ),
            )
        }
        syncScheduler.requestSync()
    }

    internal companion object {
        const val OUTBOX_TYPE = "SYLLABUS_PROGRESS"
        private const val PREFIX = "syllabus-topics/"
        private const val SUFFIX = "/progress"

        fun progressPath(topicId: String) = "$PREFIX$topicId$SUFFIX"

        fun topicIdFromPath(path: String): String? =
            path.removePrefix("/").takeIf { it.startsWith(PREFIX) }?.removePrefix(PREFIX)?.removeSuffix(SUFFIX)
    }
}
