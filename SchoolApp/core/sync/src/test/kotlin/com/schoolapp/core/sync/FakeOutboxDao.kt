package com.schoolapp.core.sync

import com.schoolapp.core.database.outbox.OutboxDao
import com.schoolapp.core.database.outbox.OutboxEntity
import com.schoolapp.core.database.outbox.OutboxRefDao
import com.schoolapp.core.database.outbox.OutboxRefEntity
import com.schoolapp.core.database.outbox.OutboxStatus
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.map

class FakeOutboxDao(entries: List<OutboxEntity>) : OutboxDao {
    val rows = MutableStateFlow(entries.associateBy { it.id })

    override suspend fun insert(entry: OutboxEntity): Long {
        rows.value += entry.id to entry
        return entry.id
    }

    override suspend fun nextPending(limit: Int): List<OutboxEntity> =
        rows.value.values.filter { it.status == OutboxStatus.PENDING }.sortedBy { it.id }.take(limit)

    override suspend fun markInFlight(id: Long) = edit(id) { it.copy(status = OutboxStatus.IN_FLIGHT, attempts = it.attempts + 1) }

    override suspend fun markRetry(id: Long, error: String?) = edit(id) { it.copy(status = OutboxStatus.PENDING, lastError = error) }

    override suspend fun markNeedsAttention(id: Long, error: String?) =
        edit(id) { it.copy(status = OutboxStatus.NEEDS_ATTENTION, lastError = error) }

    override suspend fun resetInFlight() {
        rows.value = rows.value.mapValues { (_, e) -> if (e.status == OutboxStatus.IN_FLIGHT) e.copy(status = OutboxStatus.PENDING) else e }
    }

    override suspend fun delete(id: Long) {
        rows.value -= id
    }

    override fun observePendingCount(): Flow<Int> =
        rows.map { m -> m.values.count { it.status != OutboxStatus.NEEDS_ATTENTION } }

    override fun observeNeedsAttention(): Flow<List<OutboxEntity>> =
        rows.map { m -> m.values.filter { it.status == OutboxStatus.NEEDS_ATTENTION } }

    override fun observeByType(type: String): Flow<List<OutboxEntity>> =
        rows.map { m -> m.values.filter { it.type == type }.sortedBy { it.id } }

    override fun observeByTypePrefix(prefix: String): Flow<List<OutboxEntity>> =
        rows.map { m -> m.values.filter { it.type.startsWith(prefix) }.sortedBy { it.id } }

    override fun observeByEntityKey(entityKey: String): Flow<List<OutboxEntity>> =
        rows.map { m -> m.values.filter { it.entityKey == entityKey }.sortedBy { it.id } }

    override suspend fun findByClientRequestId(clientRequestId: String): OutboxEntity? =
        rows.value.values.firstOrNull { it.clientRequestId == clientRequestId }

    override suspend fun deleteByEntityKey(entityKey: String) {
        rows.value = rows.value.filterValues { it.entityKey != entityKey || it.status == OutboxStatus.IN_FLIGHT }
    }

    override suspend fun clear() {
        rows.value = emptyMap()
    }

    private fun edit(id: Long, transform: (OutboxEntity) -> OutboxEntity) {
        rows.value[id]?.let { rows.value += id to transform(it) }
    }
}

class FakeOutboxRefDao(initial: Map<String, String> = emptyMap()) : OutboxRefDao {
    val refs = initial.toMutableMap()

    override suspend fun upsert(ref: OutboxRefEntity) {
        refs[ref.clientRequestId] = ref.entityId
    }

    override suspend fun entityId(clientRequestId: String): String? = refs[clientRequestId]
}
