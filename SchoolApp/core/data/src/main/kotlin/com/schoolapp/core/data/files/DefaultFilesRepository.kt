package com.schoolapp.core.data.files

import android.content.ContentResolver
import android.content.Context
import android.net.Uri
import android.provider.OpenableColumns
import com.schoolapp.core.common.dispatcher.IoDispatcher
import com.schoolapp.core.common.result.AppError
import com.schoolapp.core.common.result.AppResult
import com.schoolapp.core.model.files.FilePurpose
import com.schoolapp.core.model.files.UploadedFile
import com.schoolapp.core.network.ApiCaller
import com.schoolapp.core.network.api.FilesApi
import dagger.hilt.android.qualifiers.ApplicationContext
import kotlinx.coroutines.CoroutineDispatcher
import kotlinx.coroutines.withContext
import okhttp3.MediaType.Companion.toMediaTypeOrNull
import okhttp3.MultipartBody
import okhttp3.RequestBody.Companion.toRequestBody
import javax.inject.Inject
import javax.inject.Singleton
import kotlin.coroutines.cancellation.CancellationException

@Singleton
class DefaultFilesRepository @Inject constructor(
    @ApplicationContext private val context: Context,
    private val api: FilesApi,
    private val apiCaller: ApiCaller,
    @IoDispatcher private val io: CoroutineDispatcher,
) : FilesRepository {

    override suspend fun upload(uri: String, purpose: FilePurpose): AppResult<UploadedFile> {
        val picked = when (val read = read(uri)) {
            is AppResult.Success -> read.data
            is AppResult.Failure -> return read
        }
        val part = MultipartBody.Part.createFormData(
            FILE_PART,
            picked.name,
            picked.bytes.toRequestBody(picked.mime.toMediaTypeOrNull()),
        )
        val purposeBody = purpose.name.toRequestBody(TEXT)
        return apiCaller.call {
            val dto = api.upload(part, purposeBody).data
            UploadedFile(dto.id, dto.url, dto.mime ?: picked.mime, dto.size ?: picked.bytes.size.toLong(), dto.name ?: picked.name)
        }
    }

    private suspend fun read(uri: String): AppResult<PickedFile> = withContext(io) {
        try {
            val parsed = Uri.parse(uri)
            val resolver = context.contentResolver
            val bytes = resolver.openInputStream(parsed)?.use { it.readBytes() }
                ?: return@withContext AppResult.Failure(AppError.Validation(UNREADABLE))
            if (bytes.size > MAX_BYTES) return@withContext AppResult.Failure(AppError.Validation(TOO_LARGE))
            val mime = resolver.getType(parsed) ?: DEFAULT_MIME
            AppResult.Success(PickedFile(displayName(resolver, parsed) ?: DEFAULT_NAME, mime, bytes))
        } catch (e: CancellationException) {
            throw e
        } catch (e: Exception) {
            AppResult.Failure(AppError.Unknown(e))
        }
    }

    private fun displayName(resolver: ContentResolver, uri: Uri): String? =
        resolver.query(uri, arrayOf(OpenableColumns.DISPLAY_NAME), null, null, null)?.use { cursor ->
            if (cursor.moveToFirst()) cursor.getString(0) else null
        } ?: uri.lastPathSegment

    private class PickedFile(val name: String, val mime: String, val bytes: ByteArray)

    private companion object {
        const val FILE_PART = "file"
        const val DEFAULT_MIME = "application/octet-stream"
        const val DEFAULT_NAME = "upload"
        const val UNREADABLE = "The selected file could not be read."
        const val TOO_LARGE = "The file is larger than 10 MB."
        const val MAX_BYTES = 10 * 1024 * 1024
        val TEXT = "text/plain".toMediaTypeOrNull()
    }
}
