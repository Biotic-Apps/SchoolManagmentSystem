package com.schoolapp.core.data.settings

import android.content.Context
import android.net.Uri
import com.schoolapp.core.common.dispatcher.IoDispatcher
import com.schoolapp.core.common.result.AppError
import com.schoolapp.core.common.result.AppResult
import com.schoolapp.core.model.settings.ImportDetail
import com.schoolapp.core.model.settings.ImportKind
import com.schoolapp.core.model.settings.ImportSummary
import com.schoolapp.core.network.ApiCaller
import com.schoolapp.core.network.api.settings.ImportsApi
import com.schoolapp.core.network.dto.settings.CommitImportBodyDto
import dagger.hilt.android.qualifiers.ApplicationContext
import kotlinx.coroutines.CoroutineDispatcher
import kotlinx.coroutines.withContext
import okhttp3.MediaType.Companion.toMediaTypeOrNull
import okhttp3.MultipartBody
import okhttp3.RequestBody.Companion.toRequestBody
import java.io.IOException
import javax.inject.Inject
import javax.inject.Singleton

@Singleton
class DefaultImportsRepository @Inject constructor(
    @ApplicationContext private val context: Context,
    private val api: ImportsApi,
    private val apiCaller: ApiCaller,
    private val reader: ImportFileReader,
    @IoDispatcher private val io: CoroutineDispatcher,
) : ImportsRepository {

    override suspend fun saveTemplate(kind: ImportKind, destinationUri: String): AppResult<Unit> {
        val body = when (val result = apiCaller.call { api.template(kind.key) }) {
            is AppResult.Success -> result.data
            is AppResult.Failure -> return result
        }
        return withContext(io) {
            try {
                body.use { response ->
                    val out = context.contentResolver.openOutputStream(Uri.parse(destinationUri))
                        ?: return@withContext AppResult.Failure(AppError.Validation(CANNOT_SAVE))
                    out.use { response.byteStream().copyTo(it) }
                }
                AppResult.Success(Unit)
            } catch (e: IOException) {
                AppResult.Failure(AppError.Network)
            } catch (e: SecurityException) {
                AppResult.Failure(AppError.Validation(CANNOT_SAVE))
            }
        }
    }

    override suspend fun upload(uri: String, kind: ImportKind, branchId: String, sessionId: String): AppResult<String> {
        val file = when (val read = reader.read(uri)) {
            is AppResult.Success -> read.data
            is AppResult.Failure -> return read
        }
        val part = MultipartBody.Part.createFormData(FILE_PART, file.name, file.bytes.toRequestBody(file.mime.toMediaTypeOrNull()))
        val result = apiCaller.call {
            val data = api.upload(part, kind.key.text(), branchId.text(), sessionId.text()).data
            data.importId ?: data.id
        }
        return when (result) {
            is AppResult.Failure -> result
            is AppResult.Success -> result.data?.takeIf { it.isNotBlank() }?.let { AppResult.Success(it) }
                ?: AppResult.Failure(AppError.Unknown())
        }
    }

    override suspend fun history(branchId: String): AppResult<List<ImportSummary>> =
        apiCaller.call { api.history(branchId).data.toImportHistory() }

    override suspend fun detail(id: String): AppResult<ImportDetail> =
        apiCaller.call { api.detail(id).data.toImportDetail(id) }

    override suspend fun commit(id: String, skipInvalid: Boolean): AppResult<Unit> =
        apiCaller.call { api.commit(id, CommitImportBodyDto(skipInvalid.takeIf { it })) }

    override suspend fun revert(id: String): AppResult<Unit> = apiCaller.call { api.revert(id) }

    private fun String.text() = toRequestBody(TEXT)

    private companion object {
        const val FILE_PART = "file"
        const val CANNOT_SAVE = "The template could not be saved to that location."
        val TEXT = "text/plain".toMediaTypeOrNull()
    }
}
