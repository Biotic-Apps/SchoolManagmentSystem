package com.schoolapp.core.database.outbox

import androidx.room.Dao
import androidx.room.Insert
import androidx.room.OnConflictStrategy
import androidx.room.Query

@Dao
interface OutboxRefDao {
    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun upsert(ref: OutboxRefEntity)

    @Query("SELECT entity_id FROM outbox_refs WHERE client_request_id = :clientRequestId")
    suspend fun entityId(clientRequestId: String): String?
}
