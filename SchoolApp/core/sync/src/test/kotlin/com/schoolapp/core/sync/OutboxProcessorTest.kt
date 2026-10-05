package com.schoolapp.core.sync

import com.schoolapp.core.database.outbox.OutboxEntity
import com.schoolapp.core.database.outbox.OutboxStatus
import com.schoolapp.core.network.pending.PendingRequestSender
import com.schoolapp.core.network.pending.SendResult
import kotlinx.coroutines.test.runTest
import org.junit.Assert.assertEquals
import org.junit.Assert.assertTrue
import org.junit.Test

class OutboxProcessorTest {

    private fun entry(id: Long, status: OutboxStatus = OutboxStatus.PENDING) = OutboxEntity(
        id = id, type = "ATTENDANCE", method = "POST", path = "/attendance/$id", payloadJson = "{}",
        clientRequestId = "key-$id", status = status, createdAt = id,
    )

    private class RecordingSender(private val results: Map<String, SendResult>) : PendingRequestSender {
        val sent = mutableListOf<String>()
        override suspend fun send(method: String, path: String, jsonBody: String, idempotencyKey: String): SendResult {
            sent += idempotencyKey
            return results[idempotencyKey] ?: SendResult.Sent
        }
    }

    @Test
    fun sends_in_insertion_order_and_removes_sent_entries() = runTest {
        val dao = FakeOutboxDao(listOf(entry(3), entry(1), entry(2)))
        val sender = RecordingSender(emptyMap())
        assertEquals(OutboxProcessor.Outcome.COMPLETED, OutboxProcessor(dao, sender).process())
        assertEquals(listOf("key-1", "key-2", "key-3"), sender.sent)
        assertTrue(dao.rows.value.isEmpty())
    }

    @Test
    fun transient_failure_stops_so_later_entries_never_overtake() = runTest {
        val dao = FakeOutboxDao(listOf(entry(1), entry(2), entry(3)))
        val sender = RecordingSender(mapOf("key-2" to SendResult.Retry("offline")))
        assertEquals(OutboxProcessor.Outcome.RETRY_LATER, OutboxProcessor(dao, sender).process())
        assertEquals(listOf("key-1", "key-2"), sender.sent)
        assertEquals(listOf(2L, 3L), dao.rows.value.keys.sorted())
        assertEquals(OutboxStatus.PENDING, dao.rows.value.getValue(2).status)
        assertEquals(1, dao.rows.value.getValue(2).attempts)
    }

    @Test
    fun rejected_entry_is_parked_and_the_rest_continue() = runTest {
        val dao = FakeOutboxDao(listOf(entry(1), entry(2), entry(3)))
        val sender = RecordingSender(mapOf("key-1" to SendResult.Rejected(409, "locked")))
        assertEquals(OutboxProcessor.Outcome.COMPLETED, OutboxProcessor(dao, sender).process())
        assertEquals(listOf("key-1", "key-2", "key-3"), sender.sent)
        assertEquals(OutboxStatus.NEEDS_ATTENTION, dao.rows.value.getValue(1).status)
        assertEquals(setOf(1L), dao.rows.value.keys)
    }

    @Test
    fun interrupted_in_flight_entries_are_resent_first() = runTest {
        val dao = FakeOutboxDao(listOf(entry(1, OutboxStatus.IN_FLIGHT), entry(2)))
        val sender = RecordingSender(emptyMap())
        OutboxProcessor(dao, sender).process()
        assertEquals(listOf("key-1", "key-2"), sender.sent)
    }
}
