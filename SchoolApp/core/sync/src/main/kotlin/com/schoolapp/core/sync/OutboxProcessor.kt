package com.schoolapp.core.sync

import com.schoolapp.core.database.outbox.OutboxDao
import com.schoolapp.core.database.outbox.OutboxEntity
import com.schoolapp.core.database.outbox.OutboxRefDao
import com.schoolapp.core.database.outbox.OutboxRefEntity
import com.schoolapp.core.database.outbox.OutboxStatus
import com.schoolapp.core.network.pending.PendingRequestSender
import com.schoolapp.core.network.pending.SendResult
import kotlinx.serialization.json.Json
import kotlinx.serialization.json.JsonObject
import kotlinx.serialization.json.JsonPrimitive
import javax.inject.Inject

/**
 * Sends outbox entries strictly in insertion order. A transient failure stops the run so later
 * entries never overtake an earlier one; a rejected entry is parked as "needs attention".
 *
 * Dependent entries put `{ref:<clientRequestId>}` in their path; it is replaced by the `data.id` the
 * referenced request returned (kept in `outbox_refs`) before sending.
 */
class OutboxProcessor @Inject constructor(
    private val outboxDao: OutboxDao,
    private val refDao: OutboxRefDao,
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

    /** Returns false when the run must stop and retry later. */
    private suspend fun send(entry: OutboxEntity): Boolean {
        val path = when (val resolved = resolvePath(entry)) {
            is Resolution.Ready -> resolved.path
            Resolution.Wait -> return false
            is Resolution.Broken -> {
                outboxDao.markNeedsAttention(entry.id, resolved.reason)
                return true
            }
        }
        outboxDao.markInFlight(entry.id)
        return when (val result = sender.send(entry.method, path, entry.payloadJson, entry.clientRequestId)) {
            is SendResult.Sent -> {
                createdId(result.body)?.let { refDao.upsert(OutboxRefEntity(entry.clientRequestId, it)) }
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

    private suspend fun resolvePath(entry: OutboxEntity): Resolution {
        val path = entry.path
        var resolved = path
        for (match in REF.findAll(path)) {
            val ref = match.groupValues[1]
            val id = refDao.entityId(ref)
            if (id != null) {
                resolved = resolved.replace(match.value, id)
                continue
            }
            val pending = outboxDao.findByClientRequestId(ref)
            val waitable = pending != null && pending.id < entry.id && pending.status != OutboxStatus.NEEDS_ATTENTION
            return if (waitable) {
                Resolution.Wait
            } else {
                Resolution.Broken("Depends on request $ref, which was not accepted")
            }
        }
        return Resolution.Ready(resolved)
    }

    private fun createdId(body: String?): String? = body?.let {
        runCatching {
            val data = (Json.parseToJsonElement(it) as? JsonObject)?.get("data") as? JsonObject
            (data?.get("id") as? JsonPrimitive)?.takeIf { p -> p.isString }?.content
        }.getOrNull()
    }

    private sealed interface Resolution {
        data class Ready(val path: String) : Resolution
        data object Wait : Resolution
        data class Broken(val reason: String) : Resolution
    }

    companion object {
        private const val BATCH_SIZE = 20
        private const val MAX_ATTEMPTS = 10
        private val REF = Regex("""\{ref:([^}]+)\}""")

        /** Path placeholder for the server id created by the queued request [clientRequestId]. */
        fun refPlaceholder(clientRequestId: String) = "{ref:$clientRequestId}"
    }
}
