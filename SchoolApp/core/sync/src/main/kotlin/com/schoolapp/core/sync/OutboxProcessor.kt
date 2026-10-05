package com.schoolapp.core.sync

import com.schoolapp.core.database.outbox.OutboxDao
import com.schoolapp.core.database.outbox.OutboxEntity
import com.schoolapp.core.network.pending.PendingRequestSender
import com.schoolapp.core.network.pending.SendResult
import javax.inject.Inject

/**
 * Sends outbox entries strictly in insertion order. A transient failure stops the run so later
 * entries never overtake an earlier one; a rejected entry is parked as "needs attention".
 */
class OutboxProcessor @Inject constructor(
    private val outboxDao: OutboxDao,
    private val sender: PendingRequestSender,
) {
    enum class Outcome { COMPLETED, RETRY_LATER }

    suspend fun process(): Outcome {
        outboxDao.resetInFlight()
        while (true) {
            val batch = outboxDao.nextPending(BATCH_SIZE)
            if (batch.isEmpty()) return Outcome.COMPLETED
            for (entry in batch) {
                if (!send(entry)) return Outcome.RETRY_LATER
            }
        }
    }

    private suspend fun send(entry: OutboxEntity): Boolean {
        outboxDao.markInFlight(entry.id)
        return when (val result = sender.send(entry.method, entry.path, entry.payloadJson, entry.clientRequestId)) {
            SendResult.Sent -> {
                outboxDao.delete(entry.id)
                true
            }
            is SendResult.Rejected -> {
                outboxDao.markNeedsAttention(entry.id, "HTTP ${result.httpCode}: ${result.reason.orEmpty()}")
                true
            }
            is SendResult.Retry -> {
                if (entry.attempts + 1 >= MAX_ATTEMPTS) {
                    outboxDao.markNeedsAttention(entry.id, result.reason)
                    true
                } else {
                    outboxDao.markRetry(entry.id, result.reason)
                    false
                }
            }
        }
    }

    private companion object {
        const val BATCH_SIZE = 20
        const val MAX_ATTEMPTS = 10
    }
}
