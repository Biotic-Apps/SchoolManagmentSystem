package com.schoolapp.core.data.settings

import android.content.Context
import android.net.Uri
import android.provider.OpenableColumns
import com.schoolapp.core.common.dispatcher.IoDispatcher
import com.schoolapp.core.common.result.AppError
import com.schoolapp.core.common.result.AppResult
import dagger.hilt.android.qualifiers.ApplicationContext
import kotlinx.coroutines.CoroutineDispatcher
import kotlinx.coroutines.withContext
import java.util.Locale
import javax.inject.Inject
import kotlin.coroutines.cancellation.CancellationException

/** Reads a picked import file (.xlsx / .csv, at most 5 MB) on the IO dispatcher. */
class ImportFileReader @Inject constructor(
    @ApplicationContext private val context: Context,
    @IoDispatcher private val io: CoroutineDispatcher,
) {
    class Picked(val name: String, val mime: String, val bytes: ByteArray)

    suspend fun read(uri: String): AppResult<Picked> = withContext(io) {
        try {
            val parsed = Uri.parse(uri)
            val resolver = context.contentResolver
            val name = resolver.query(parsed, arrayOf(OpenableColumns.DISPLAY_NAME), null, null, null)?.use { cursor ->
                if (cursor.moveToFirst()) cursor.getString(0) else null
            } ?: parsed.lastPathSegment ?: DEFAULT_NAME
            val extension = name.substringAfterLast('.', "").lowercase(Locale.ROOT)
            if (extension !in EXTENSIONS) return@withContext AppResult.Failure(AppError.Validation(WRONG_TYPE))
            val bytes = resolver.openInputStream(parsed)?.use { it.readBytes() }
                ?: return@withContext AppResult.Failure(AppError.Validation(UNREADABLE))
            if (bytes.size > MAX_BYTES) return@withContext AppResult.Failure(AppError.Validation(TOO_LARGE))
            AppResult.Success(Picked(name, if (extension == "csv") CSV else XLSX, bytes))
        } catch (e: CancellationException) {
            throw e
        } catch (e: Exception) {
            AppResult.Failure(AppError.Validation(UNREADABLE))
        }
    }

    private companion object {
        const val DEFAULT_NAME = "import.xlsx"
        const val XLSX = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
        const val CSV = "text/csv"
        const val MAX_BYTES = 5 * 1024 * 1024
        val EXTENSIONS = setOf("xlsx", "csv")
        const val WRONG_TYPE = "Choose an .xlsx or .csv file."
        const val UNREADABLE = "The selected file could not be read."
        const val TOO_LARGE = "The file must be 5 MB or smaller."
    }
}
