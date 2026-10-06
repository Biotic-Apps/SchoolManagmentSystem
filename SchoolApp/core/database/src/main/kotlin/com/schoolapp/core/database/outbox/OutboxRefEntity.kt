package com.schoolapp.core.database.outbox

import androidx.room.ColumnInfo
import androidx.room.Entity
import androidx.room.PrimaryKey

/** Server id created by a sent outbox request, so later queued requests can reference it. */
@Entity(tableName = "outbox_refs")
data class OutboxRefEntity(
    @PrimaryKey @ColumnInfo(name = "client_request_id") val clientRequestId: String,
    @ColumnInfo(name = "entity_id") val entityId: String,
)
