package com.schoolapp.core.database.outbox

import androidx.room.Dao
import androidx.room.Insert
import androidx.room.OnConflictStrategy
import androidx.room.Query
import kotlinx.coroutines.flow.Flow

@Dao
interface OutboxDao {

    @Insert(onConflict = OnConflictStrategy.IGNORE)
    suspend fun insert(entry: OutboxEntity): Long

    @Query("SELECT * FROM outbox WHERE status = 'PENDING' ORDER BY id ASC LIMIT :limit")
    suspend fun nextPending(limit: Int): List<OutboxEntity>

    @Query("UPDATE outbox SET status = 'IN_FLIGHT', attempts = attempts + 1 WHERE id = :id")
    suspend fun markInFlight(id: Long)

    @Query("UPDATE outbox SET status = 'PENDING', last_error = :error WHERE id = :id")
    suspend fun markRetry(id: Long, error: String?)

    @Query("UPDATE outbox SET status = 'NEEDS_ATTENTION', last_error = :error WHERE id = :id")
    suspend fun markNeedsAttention(id: Long, error: String?)

    @Query("UPDATE outbox SET status = 'PENDING' WHERE status = 'IN_FLIGHT'")
    suspend fun resetInFlight()

    @Query("DELETE FROM outbox WHERE id = :id")
    suspend fun delete(id: Long)

    @Query("SELECT COUNT(*) FROM outbox WHERE status != 'NEEDS_ATTENTION'")
    fun observePendingCount(): Flow<Int>

    @Query("SELECT * FROM outbox WHERE status = 'NEEDS_ATTENTION' ORDER BY id ASC")
    fun observeNeedsAttention(): Flow<List<OutboxEntity>>

    @Query("SELECT * FROM outbox WHERE type = :type ORDER BY id ASC")
    fun observeByType(type: String): Flow<List<OutboxEntity>>

    @Query("DELETE FROM outbox")
    suspend fun clear()
}
