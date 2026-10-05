package com.schoolapp.core.database.outbox

import androidx.room.ColumnInfo
import androidx.room.Entity
import androidx.room.Index
import androidx.room.PrimaryKey

/** A pending API call recorded while offline; sent in insertion order by the sync worker. */
@Entity(
    tableName = "outbox",
    indices = [Index(value = ["client_request_id"], unique = true), Index(value = ["status"])],
)
data class OutboxEntity(
    @PrimaryKey(autoGenerate = true) val id: Long = 0,
    val type: String,
    val method: String,
    val path: String,
    @ColumnInfo(name = "payload_json") val payloadJson: String,
    @ColumnInfo(name = "client_request_id") val clientRequestId: String,
    val attempts: Int = 0,
    @ColumnInfo(name = "last_error") val lastError: String? = null,
    val status: OutboxStatus = OutboxStatus.PENDING,
    @ColumnInfo(name = "created_at") val createdAt: Long,
)
