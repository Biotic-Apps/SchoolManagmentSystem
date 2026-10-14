package com.schoolapp.core.network.dto.settings

import kotlinx.serialization.Serializable
import kotlinx.serialization.json.JsonElement

@Serializable
data class QueueHealthDto(val driver: String? = null, val waiting: Int = 0, val failed: Int = 0)

@Serializable
data class StorageHealthDto(val driver: String? = null, val ok: Boolean = false)

/** GET `/support/health`; `lastBackup` may be an object or a bare timestamp. */
@Serializable
data class SystemHealthDto(
    val db: String? = null,
    val queue: QueueHealthDto = QueueHealthDto(),
    val storage: StorageHealthDto = StorageHealthDto(),
    val lastBackup: JsonElement? = null,
    val lastRestoreVerified: String? = null,
    val version: String? = null,
)

/** Row of GET `/support/notifications/failed`; `recipient` may be an object or a string. */
@Serializable
data class FailedNotificationDto(
    val id: String,
    val recipient: JsonElement? = null,
    val channel: String? = null,
    val category: String? = null,
    val title: String? = null,
    val attempts: Int = 0,
    val lastError: String? = null,
    val at: String? = null,
)

/** Body of POST `/support/notifications/failed/resend-all`. */
@Serializable
data class ResendAllBodyDto(
    val schoolId: String? = null,
    val channel: String? = null,
    val from: String? = null,
    val to: String? = null,
)

/** Row of GET `/support/jobs`. */
@Serializable
data class JobRunDto(
    val id: String,
    val queue: String? = null,
    val name: String? = null,
    val status: String? = null,
    val attempts: Int? = null,
    val error: String? = null,
    val startedAt: String? = null,
    val createdAt: String? = null,
    val finishedAt: String? = null,
)

@Serializable
data class TestMessageBodyDto(val channel: String, val to: String)

@Serializable
data class TestMessageResultDto(val ok: Boolean = false, val error: String? = null)
