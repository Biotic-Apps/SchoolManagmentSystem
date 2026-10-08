package com.schoolapp.core.data.exams

import com.schoolapp.core.common.result.AppError
import com.schoolapp.core.common.result.AppResult
import com.schoolapp.core.data.fakes.CountingSyncScheduler
import com.schoolapp.core.data.fakes.InMemoryOutboxDao
import com.schoolapp.core.model.exams.LoadedMarkSheet
import com.schoolapp.core.model.exams.MarkEntry
import com.schoolapp.core.model.exams.MarkSheetOutcome
import com.schoolapp.core.model.exams.MarkSheetSyncState
import com.schoolapp.core.network.ApiCaller
import com.schoolapp.core.network.NetworkJson
import com.schoolapp.core.network.dto.exams.MarkSheetBodyDto
import kotlinx.coroutines.flow.first
import kotlinx.coroutines.test.UnconfinedTestDispatcher
import kotlinx.coroutines.test.runTest
import kotlinx.serialization.json.jsonObject
import org.junit.Assert.assertEquals
import org.junit.Assert.assertNull
import org.junit.Assert.assertTrue
import org.junit.Test
import java.io.IOException

class DefaultExamsRepositoryTest {

    private val dispatcher = UnconfinedTestDispatcher()
    private val api = FakeExamsApi()
    private val outbox = InMemoryOutboxDao()
    private val sync = CountingSyncScheduler()
    private val repository = ApiCaller(NetworkJson, dispatcher).let { caller ->
        DefaultExamsRepository(api, caller, outbox, sync, NetworkJson, dispatcher, ExamTermNames(api, caller))
    }
    private val entries = listOf(MarkEntry("s1", 0.0, false), MarkEntry("s2", null, false, " late "), MarkEntry("s3", 40.0, true))

    @Test
    fun offline_save_is_queued_with_its_request_id_and_pending_kept_null() = runTest(dispatcher) {
        api.fail = IOException("offline")

        assertEquals(AppResult.Success(MarkSheetOutcome.Queued), repository.saveMarks("ms1", entries, "req-1"))

        val row = outbox.rows.value.single()
        assertEquals("PUT", row.method)
        assertEquals("mark-sheets/ms1", row.path)
        assertEquals("req-1", row.clientRequestId)
        assertEquals(DefaultExamsRepository.OUTBOX_SAVE, row.type)
        val body = NetworkJson.decodeFromString(MarkSheetBodyDto.serializer(), row.payloadJson)
        assertEquals(listOf(0.0, null, null), body.rows.map { it.marks })
        assertEquals("late", body.rows[1].remark)
        assertEquals(1, sync.requests)
        assertEquals(MarkSheetSyncState.QUEUED, repository.syncState("ms1").first())
    }

    @Test
    fun later_save_queues_behind_earlier_one_without_calling_the_server() = runTest(dispatcher) {
        api.fail = IOException("offline")
        repository.saveMarks("ms1", entries, "req-1")
        api.fail = null

        assertEquals(AppResult.Success(MarkSheetOutcome.Queued), repository.saveMarks("ms1", entries.take(1), "req-2"))
        assertEquals(0, api.saveCalls)
        assertEquals(listOf("req-1", "req-2"), outbox.rows.value.map { it.clientRequestId })
    }

    @Test
    fun offline_reopen_overlays_queued_marks_on_last_server_copy() = runTest(dispatcher) {
        repository.markSheet("ms1")
        api.fail = IOException("offline")
        repository.saveMarks("ms1", listOf(MarkEntry("s2", 7.5, false)), "req-1")

        val loaded = (repository.markSheet("ms1") as AppResult.Success<LoadedMarkSheet>).data

        assertTrue(loaded.offline)
        assertEquals(listOf("s2"), loaded.localEntries?.map { it.studentId })
        assertEquals(7.5, loaded.sheet.rows.first { it.studentId == "s2" }.marks)
    }

    @Test
    fun offline_submit_queues_save_then_submit_with_derived_key() = runTest(dispatcher) {
        api.fail = IOException("offline")

        assertEquals(AppResult.Success(MarkSheetOutcome.Queued), repository.submit("ms1", entries, "req-9"))

        assertEquals(
            listOf(DefaultExamsRepository.OUTBOX_SAVE, DefaultExamsRepository.OUTBOX_SUBMIT),
            outbox.rows.value.map { it.type },
        )
        assertEquals("req-9-submit", outbox.rows.value[1].clientRequestId)
    }

    @Test
    fun probation_submit_becomes_pending_review() = runTest(dispatcher) {
        api.submitResponse = NetworkJson.parseToJsonElement("""{"status":"PENDING_REVIEW","approvalId":"ap-3"}""").jsonObject
        assertEquals(AppResult.Success(MarkSheetOutcome.PendingReview("ap-3")), repository.submit("ms1", entries, "req-p"))
        assertEquals("req-p-submit", api.lastSubmitKey)
    }

    @Test
    fun discard_drops_queued_rows() = runTest(dispatcher) {
        api.fail = IOException("offline")
        repository.saveMarks("ms1", entries, "req-1")
        repository.discardLocal("ms1")
        assertTrue(outbox.rows.value.isEmpty())
        assertEquals(MarkSheetSyncState.NONE, repository.syncState("ms1").first())
        api.fail = null
        assertNull((repository.markSheet("ms1") as AppResult.Success).data.localEntries)
    }

    @Test
    fun offline_without_cached_copy_is_a_network_failure() = runTest(dispatcher) {
        api.fail = IOException("offline")
        assertEquals(AppResult.Failure(AppError.Network), repository.markSheet("ms1"))
    }
}
