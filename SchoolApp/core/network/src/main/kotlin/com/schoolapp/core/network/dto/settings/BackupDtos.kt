package com.schoolapp.core.network.dto.settings

import kotlinx.serialization.Serializable
import kotlinx.serialization.json.JsonElement

@Serializable
data class BackupCheckDto(
    val name: String = "",
    val expected: JsonElement? = null,
    val actual: JsonElement? = null,
    val ok: Boolean = false,
)

@Serializable
data class BackupVerifyDto(
    val status: String? = null,
    val at: String? = null,
    val checks: List<BackupCheckDto> = emptyList(),
    val error: String? = null,
)

/** Row of GET `/backups` (super admin only). */
@Serializable
data class BackupRunDto(
    val id: String,
    val startedAt: String? = null,
    val finishedAt: String? = null,
    val status: String? = null,
    val sizeBytes: Long? = null,
    val checksumSha256: String? = null,
    val encrypted: Boolean = false,
    val trigger: String? = null,
    val error: String? = null,
    val verify: BackupVerifyDto? = null,
)

/** `{ jobId }` of POST `/backups` and `/backups/:id/verify`. */
@Serializable
data class JobIdDto(val jobId: String? = null)

/** GET `/backups/:id/download`: short-lived signed link. */
@Serializable
data class BackupDownloadDto(val url: String? = null, val expiresAt: String? = null)
