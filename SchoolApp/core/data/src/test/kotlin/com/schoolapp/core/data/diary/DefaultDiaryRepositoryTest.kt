package com.schoolapp.core.data.diary

import com.schoolapp.core.common.result.AppResult
import com.schoolapp.core.data.fakes.CountingSyncScheduler
import com.schoolapp.core.data.fakes.InMemoryOutboxDao
import com.schoolapp.core.model.diary.DiaryInput
import com.schoolapp.core.model.diary.DiaryOutcome
import com.schoolapp.core.model.diary.DiaryStatus
import com.schoolapp.core.network.ApiCaller
import com.schoolapp.core.network.NetworkJson
import com.schoolapp.core.network.api.DiaryApi
import com.schoolapp.core.network.dto.common.CommentBodyDto
import com.schoolapp.core.network.dto.diary.DiaryBodyDto
import com.schoolapp.core.network.dto.diary.DiaryEntryDto
import com.schoolapp.core.network.dto.diary.MissingDiaryDto
import com.schoolapp.core.network.model.ApiEnvelope
import kotlinx.coroutines.flow.first
import kotlinx.coroutines.test.UnconfinedTestDispatcher
import kotlinx.coroutines.test.runTest
import kotlinx.serialization.json.JsonObject
import kotlinx.serialization.json.jsonObject
import org.junit.Assert.assertEquals
import org.junit.Test
import java.io.IOException

class DefaultDiaryRepositoryTest {

    private val dispatcher = UnconfinedTestDispatcher()
    private val api = FakeDiaryApi()
    private val outbox = InMemoryOutboxDao()
    private val sync = CountingSyncScheduler()
    private val repository = DefaultDiaryRepository(api, ApiCaller(NetworkJson, dispatcher), outbox, sync, NetworkJson, dispatcher)
    private val input = DiaryInput("sec", "math", "2026-10-06", " Fractions ", "Page 12", "2026-10-07")

    @Test
    fun offline_publish_queues_save_then_publish_referencing_it() = runTest(dispatcher) {
        api.fail = IOException("offline")

        assertEquals(AppResult.Success(DiaryOutcome.Queued), repository.publish(input, null, "crid-0001"))

        val (save, publish) = outbox.rows.value
        assertEquals("PUT", save.method)
        assertEquals("diary", save.path)
        assertEquals("crid-0001", save.clientRequestId)
        assertEquals("crid-0001", NetworkJson.decodeFromString(DiaryBodyDto.serializer(), save.payloadJson).clientRequestId)
        assertEquals("POST", publish.method)
        assertEquals("diary/{ref:crid-0001}/publish", publish.path)
        assertEquals("crid-0001-publish", publish.clientRequestId)
        assertEquals(true, save.id < publish.id)
        assertEquals(setOf(input.slotKey), repository.queuedSlots.first())
        assertEquals(1, sync.requests)
    }

    @Test
    fun offline_publish_of_existing_entry_uses_its_id() = runTest(dispatcher) {
        api.fail = IOException("offline")
        repository.publish(input, "d-7", "crid-0002")
        assertEquals("diary/d-7/publish", outbox.rows.value.last().path)
    }

    @Test
    fun online_publish_saves_then_publishes_with_derived_key() = runTest(dispatcher) {
        api.publishResponse = entry("PUBLISHED")
        val outcome = (repository.publish(input, null, "crid-0003") as AppResult.Success).data
        assertEquals(DiaryStatus.PUBLISHED, (outcome as DiaryOutcome.Saved).entry.status)
        assertEquals(listOf("save:crid-0003", "publish:d-1:crid-0003-publish"), api.calls)
        assertEquals("Fractions", api.lastBody?.topics)
    }

    @Test
    fun moderated_publish_is_pending_review() = runTest(dispatcher) {
        api.publishResponse = entry("SUBMITTED", approvalId = "ap-3")
        assertEquals(AppResult.Success(DiaryOutcome.PendingReview("ap-3")), repository.publish(input, null, "crid-0004"))
    }

    private fun entry(status: String, approvalId: String? = null): JsonObject = NetworkJson.encodeToJsonElement(
        DiaryEntryDto.serializer(),
        DiaryEntryDto(id = "d-1", sectionId = "sec", date = "2026-10-06", topics = "Fractions", status = status, approvalId = approvalId),
    ).jsonObject

    private inner class FakeDiaryApi : DiaryApi {
        var fail: Exception? = null
        var publishResponse: JsonObject = JsonObject(emptyMap())
        val calls = mutableListOf<String>()
        var lastBody: DiaryBodyDto? = null

        override suspend fun save(body: DiaryBodyDto, idempotencyKey: String): ApiEnvelope<JsonObject> {
            fail?.let { throw it }
            calls += "save:$idempotencyKey"
            lastBody = body
            return ApiEnvelope(entry("DRAFT"))
        }

        override suspend fun publish(id: String, idempotencyKey: String): ApiEnvelope<JsonObject> {
            fail?.let { throw it }
            calls += "publish:$id:$idempotencyKey"
            return ApiEnvelope(publishResponse)
        }

        override suspend fun entries(sectionId: String?, date: String?, from: String?, to: String?, branchId: String?, status: String?) = ApiEnvelope(emptyList<DiaryEntryDto>())
        override suspend fun returnEntry(id: String, body: CommentBodyDto) = ApiEnvelope(DiaryEntryDto(id = id))
        override suspend fun missing(branchId: String?, date: String) = ApiEnvelope(emptyList<MissingDiaryDto>())
    }
}
