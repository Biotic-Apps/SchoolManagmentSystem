package com.schoolapp.core.data.fakes

import com.schoolapp.core.database.attendance.AttendanceRegisterDao
import com.schoolapp.core.database.attendance.AttendanceRegisterEntity
import com.schoolapp.core.database.outbox.OutboxDao
import com.schoolapp.core.database.outbox.OutboxEntity
import com.schoolapp.core.database.outbox.OutboxStatus
import com.schoolapp.core.sync.SyncScheduler
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.map
import okhttp3.ResponseBody.Companion.toResponseBody
import retrofit2.HttpException
import retrofit2.Response

class InMemoryOutboxDao : OutboxDao {
    val rows = MutableStateFlow<List<OutboxEntity>>(emptyList())

    override suspend fun insert(entry: OutboxEntity): Long {
        if (rows.value.any { it.clientRequestId == entry.clientRequestId }) return -1
        val id = (rows.value.maxOfOrNull { it.id } ?: 0) + 1
        rows.value += entry.copy(id = id)
        return id
    }

    override suspend fun nextPending(limit: Int) = rows.value.filter { it.status == OutboxStatus.PENDING }.take(limit)
    override suspend fun markInFlight(id: Long) = edit(id) { it.copy(status = OutboxStatus.IN_FLIGHT) }
    override suspend fun markRetry(id: Long, error: String?) = edit(id) { it.copy(status = OutboxStatus.PENDING) }
    override suspend fun markNeedsAttention(id: Long, error: String?) = edit(id) { it.copy(status = OutboxStatus.NEEDS_ATTENTION) }
    override suspend fun resetInFlight() = Unit
    override suspend fun delete(id: Long) { rows.value = rows.value.filterNot { it.id == id } }
    override fun observePendingCount(): Flow<Int> = rows.map { it.size }
    override fun observeNeedsAttention(): Flow<List<OutboxEntity>> = rows.map { l -> l.filter { it.status == OutboxStatus.NEEDS_ATTENTION } }
    override fun observeByType(type: String): Flow<List<OutboxEntity>> = rows.map { l -> l.filter { it.type == type } }
    override fun observeByTypePrefix(prefix: String): Flow<List<OutboxEntity>> = rows.map { l -> l.filter { it.type.startsWith(prefix) } }
    override fun observeByEntityKey(entityKey: String): Flow<List<OutboxEntity>> = rows.map { l -> l.filter { it.entityKey == entityKey } }
    override suspend fun findByClientRequestId(clientRequestId: String) = rows.value.firstOrNull { it.clientRequestId == clientRequestId }
    override suspend fun deleteByEntityKey(entityKey: String) {
        rows.value = rows.value.filterNot { it.entityKey == entityKey && it.status != OutboxStatus.IN_FLIGHT }
    }
    override suspend fun clear() { rows.value = emptyList() }

    private fun edit(id: Long, transform: (OutboxEntity) -> OutboxEntity) {
        rows.value = rows.value.map { if (it.id == id) transform(it) else it }
    }
}

class InMemoryAttendanceRegisterDao : AttendanceRegisterDao {
    val rows = mutableMapOf<Pair<String, String>, AttendanceRegisterEntity>()

    override suspend fun get(sectionId: String, date: String) = rows[sectionId to date]
    override suspend fun upsert(entity: AttendanceRegisterEntity) { rows[entity.sectionId to entity.date] = entity }
    override suspend fun clearLocal(sectionId: String, date: String) {
        rows[sectionId to date]?.let { rows[sectionId to date] = it.copy(localMarksJson = null) }
    }
    override suspend fun latestForSection(sectionId: String) =
        rows.values.filter { it.sectionId == sectionId }.maxByOrNull { it.date }
}

class CountingSyncScheduler : SyncScheduler {
    var requests = 0
    override fun requestSync() { requests++ }
}

/** Retrofit-style HTTP failure carrying the API error envelope. */
fun httpError(code: Int, apiCode: String): HttpException = HttpException(
    Response.error<Any>(code, """{"error":{"code":"$apiCode","message":"$apiCode"}}""".toResponseBody()),
)
