package com.schoolapp.core.data.settings

import com.schoolapp.core.common.result.AppError
import com.schoolapp.core.common.result.AppResult
import com.schoolapp.core.model.settings.BackupCheck
import com.schoolapp.core.model.settings.BackupRun
import com.schoolapp.core.model.settings.BackupVerify
import com.schoolapp.core.network.ApiCaller
import com.schoolapp.core.network.api.settings.BackupsApi
import com.schoolapp.core.network.dto.settings.BackupCheckDto
import com.schoolapp.core.network.dto.settings.BackupRunDto
import kotlinx.serialization.json.JsonElement
import kotlinx.serialization.json.JsonNull
import kotlinx.serialization.json.JsonPrimitive
import kotlinx.serialization.json.contentOrNull
import kotlinx.serialization.json.doubleOrNull
import javax.inject.Inject
import javax.inject.Singleton

@Singleton
class DefaultBackupsRepository @Inject constructor(
    private val api: BackupsApi,
    private val apiCaller: ApiCaller,
) : BackupsRepository {

    override suspend fun backups(): AppResult<List<BackupRun>> =
        apiCaller.call { api.list().data.map { it.toModel() }.sortedByDescending { it.startedAt.orEmpty() } }

    override suspend fun runBackup(): AppResult<Unit> = apiCaller.call { api.run() }.unit()

    override suspend fun verify(id: String): AppResult<Unit> = apiCaller.call { api.verify(id) }.unit()

    override suspend fun downloadUrl(id: String): AppResult<String> {
        val result = apiCaller.call { api.download(id).data.url }
        return when {
            result is AppResult.Failure -> result
            (result as AppResult.Success).data.isHttpUrl() -> AppResult.Success(result.data.orEmpty())
            else -> AppResult.Failure(AppError.Validation(NOT_AVAILABLE))
        }
    }

    private fun String?.isHttpUrl(): Boolean = this != null && (startsWith("https://") || startsWith("http://"))

    private fun <T> AppResult<T>.unit(): AppResult<Unit> = when (this) {
        is AppResult.Success -> AppResult.Success(Unit)
        is AppResult.Failure -> this
    }

    private companion object {
        const val NOT_AVAILABLE = "The backup file is not available."
        const val NOT_RUN = "NOT_RUN"
    }

    private fun BackupRunDto.toModel() = BackupRun(
        id = id,
        startedAt = startedAt,
        finishedAt = finishedAt,
        status = status.orEmpty(),
        sizeBytes = sizeBytes,
        checksumSha256 = checksumSha256,
        encrypted = encrypted,
        error = error,
        verify = BackupVerify(
            status = verify?.status ?: NOT_RUN,
            at = verify?.at,
            checks = verify?.checks.orEmpty().map { it.toModel() },
            error = verify?.error,
        ),
    )

    private fun BackupCheckDto.toModel(): BackupCheck {
        val expectedText = expected.text()
        val actualText = actual.text()
        val numeric = listOf(expected, actual).all { it == null || it == JsonNull || (it as? JsonPrimitive)?.doubleOrNull != null }
        return BackupCheck(name, expectedText, actualText, numeric, ok)
    }

    private fun JsonElement?.text(): String? = when (this) {
        null, JsonNull -> null
        is JsonPrimitive -> contentOrNull
        else -> toString()
    }
}
