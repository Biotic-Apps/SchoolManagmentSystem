package com.schoolapp.core.data.syllabus

import com.schoolapp.core.common.result.AppResult
import com.schoolapp.core.database.outbox.OutboxDao
import com.schoolapp.core.database.outbox.OutboxEntity
import com.schoolapp.core.model.syllabus.ProgressOutcome
import com.schoolapp.core.model.syllabus.TopicProgressUpdate
import com.schoolapp.core.model.syllabus.TopicStatus
import com.schoolapp.core.network.ApiCaller
import com.schoolapp.core.network.NetworkJson
import com.schoolapp.core.network.api.SyllabusApi
import com.schoolapp.core.network.dto.syllabus.BookListDto
import com.schoolapp.core.network.dto.syllabus.CoverageDto
import com.schoolapp.core.network.dto.syllabus.SyllabusPlanDto
import com.schoolapp.core.network.dto.syllabus.TopicProgressBodyDto
import com.schoolapp.core.network.model.ApiEnvelope
import com.schoolapp.core.sync.SyncScheduler
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.first
import kotlinx.coroutines.flow.map
import kotlinx.coroutines.test.UnconfinedTestDispatcher
import kotlinx.coroutines.test.runTest
import kotlinx.serialization.json.JsonObject
import kotlinx.serialization.json.JsonPrimitive
import org.junit.Assert.assertEquals
import org.junit.Assert.assertTrue
import org.junit.Test
import java.io.IOException

class DefaultSyllabusRepositoryTest {

    private val dispatcher = UnconfinedTestDispatcher()
    private val api = FakeSyllabusApi()
    private val outbox = RecordingOutboxDao()
    private var syncRequests = 0
    private val repository = DefaultSyllabusRepository(
        api, ApiCaller(NetworkJson, dispatcher), outbox, object : SyncScheduler { override fun requestSync() { syncRequests++ } }, NetworkJson, dispatcher,
    )
    private val update = TopicProgressUpdate(TopicStatus.COMPLETED, "2026-10-05", " done ")

    @Test
    fun online_update_sends_idempotency_key_and_trimmed_body() = runTest(dispatcher) {
        val result = repository.updateProgress("t1", update, "req-1")
        assertEquals(AppResult.Success(ProgressOutcome.Applied), result)
        assertEquals(Triple("t1", TopicProgressBodyDto("COMPLETED", "2026-10-05", "done"), "req-1"), api.calls.single())
        assertTrue(outbox.rows.value.isEmpty())
    }

    @Test
    fun probation_answer_becomes_pending_review() = runTest(dispatcher) {
        api.response = JsonObject(mapOf("status" to JsonPrimitive("PENDING_REVIEW"), "approvalId" to JsonPrimitive("ap1")))
        assertEquals(AppResult.Success(ProgressOutcome.PendingReview("ap1")), repository.updateProgress("t1", update, "req-1"))
    }

    @Test
    fun offline_update_is_queued_with_same_key_and_sync_requested() = runTest(dispatcher) {
        api.fail = IOException("offline")
        val result = repository.updateProgress("t9", update, "req-9")
        assertEquals(AppResult.Success(ProgressOutcome.Queued), result)
        val row = outbox.rows.value.single()
        assertEquals("POST", row.method)
        assertEquals("syllabus-topics/t9/progress", row.path)
        assertEquals("req-9", row.clientRequestId)
        assertEquals(TopicProgressBodyDto("COMPLETED", "2026-10-05", "done"), NetworkJson.decodeFromString<TopicProgressBodyDto>(row.payloadJson))
        assertEquals(1, syncRequests)
        assertEquals(setOf("t9"), repository.queuedTopicIds.first())
    }

    @Test
    fun in_progress_update_drops_completed_on() = runTest(dispatcher) {
        repository.updateProgress("t1", update.copy(status = TopicStatus.IN_PROGRESS), "req-2")
        assertEquals(null, api.calls.single().second.completedOn)
    }

    private class FakeSyllabusApi : SyllabusApi {
        val calls = mutableListOf<Triple<String, TopicProgressBodyDto, String>>()
        var response = JsonObject(mapOf("id" to JsonPrimitive("t1"), "status" to JsonPrimitive("COMPLETED")))
        var fail: Exception? = null

        override suspend fun updateProgress(topicId: String, body: TopicProgressBodyDto, idempotencyKey: String): ApiEnvelope<JsonObject> {
            fail?.let { throw it }
            calls += Triple(topicId, body, idempotencyKey)
            return ApiEnvelope(response)
        }

        override suspend fun plans(sectionId: String?, subjectId: String?, sessionId: String?) = ApiEnvelope(emptyList<SyllabusPlanDto>())
        override suspend fun coverage(branchId: String?, sessionId: String?, classId: String?) = ApiEnvelope(emptyList<CoverageDto>())
        override suspend fun bookLists(branchId: String?, classId: String?) = ApiEnvelope(emptyList<BookListDto>())
    }

    private class RecordingOutboxDao : OutboxDao {
        val rows = MutableStateFlow<List<OutboxEntity>>(emptyList())
        override suspend fun insert(entry: OutboxEntity): Long {
            rows.value += entry.copy(id = rows.value.size + 1L)
            return rows.value.size.toLong()
        }
        override fun observeByType(type: String): Flow<List<OutboxEntity>> = rows.map { list -> list.filter { it.type == type } }
        override fun observeByTypePrefix(prefix: String): Flow<List<OutboxEntity>> = rows.map { list -> list.filter { it.type.startsWith(prefix) } }
        override fun observeByEntityKey(entityKey: String): Flow<List<OutboxEntity>> = rows.map { list -> list.filter { it.entityKey == entityKey } }
        override suspend fun findByClientRequestId(clientRequestId: String): OutboxEntity? = rows.value.firstOrNull { it.clientRequestId == clientRequestId }
        override suspend fun deleteByEntityKey(entityKey: String) = Unit
        override suspend fun nextPending(limit: Int): List<OutboxEntity> = rows.value
        override suspend fun markInFlight(id: Long) = Unit
        override suspend fun markRetry(id: Long, error: String?) = Unit
        override suspend fun markNeedsAttention(id: Long, error: String?) = Unit
        override suspend fun resetInFlight() = Unit
        override suspend fun delete(id: Long) = Unit
        override fun observePendingCount(): Flow<Int> = rows.map { it.size }
        override fun observeNeedsAttention(): Flow<List<OutboxEntity>> = rows.map { emptyList() }
        override suspend fun clear() = Unit
    }
}
