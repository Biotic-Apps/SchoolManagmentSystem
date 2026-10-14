package com.schoolapp.core.data.settings

import com.schoolapp.core.model.settings.FailedNotification
import com.schoolapp.core.model.settings.JobRun
import com.schoolapp.core.model.settings.SystemHealth
import com.schoolapp.core.network.dto.settings.FailedNotificationDto
import com.schoolapp.core.network.dto.settings.JobRunDto
import com.schoolapp.core.network.dto.settings.SystemHealthDto
import kotlinx.serialization.json.JsonElement
import kotlinx.serialization.json.JsonObject
import kotlinx.serialization.json.JsonPrimitive
import kotlinx.serialization.json.contentOrNull

private const val DB_OK = "ok"

internal fun SystemHealthDto.toModel() = SystemHealth(
    dbOk = db.equals(DB_OK, ignoreCase = true),
    queueDriver = queue.driver,
    queueWaiting = queue.waiting,
    queueFailed = queue.failed,
    storageDriver = storage.driver,
    storageOk = storage.ok,
    lastBackupAt = lastBackup.lastBackupAt(),
    lastRestoreVerified = lastRestoreVerified,
    version = version,
)

/** `lastBackup` is `{ finishedAt, startedAt }` or a bare timestamp. */
private fun JsonElement?.lastBackupAt(): String? = when (this) {
    is JsonPrimitive -> contentOrNull?.takeIf { isString }
    is JsonObject -> text("finishedAt") ?: text("startedAt")
    else -> null
}

internal fun FailedNotificationDto.toModel(): FailedNotification {
    val (name, contact) = recipient.recipientParts()
    return FailedNotification(id, name, contact, channel, category, attempts, lastError, at)
}

/** Name plus masked contact; a recipient with no name shows the contact as the name. */
private fun JsonElement?.recipientParts(): Pair<String?, String?> = when (this) {
    is JsonPrimitive -> contentOrNull to null
    is JsonObject -> {
        val name = text("name")
        val contact = text("contact")
        if (name != null) name to contact else contact to null
    }
    else -> null to null
}

internal fun JobRunDto.toModel() = JobRun(
    id = id,
    queue = queue.orEmpty(),
    name = name.orEmpty(),
    status = status.orEmpty(),
    attempts = attempts,
    error = error,
    startedAt = startedAt ?: createdAt,
    finishedAt = finishedAt,
)

internal fun JsonObject.text(key: String): String? =
    (this[key] as? JsonPrimitive)?.takeIf { it.isString }?.content?.takeIf { it.isNotBlank() }
