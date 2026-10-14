package com.schoolapp.core.data.fees.pdf

import android.content.Context
import android.content.Intent
import android.net.Uri
import androidx.core.content.FileProvider
import com.schoolapp.core.common.dispatcher.IoDispatcher
import com.schoolapp.core.common.result.AppResult
import com.schoolapp.core.network.ApiCaller
import com.schoolapp.core.network.api.fees.PdfStreamApi
import dagger.hilt.android.qualifiers.ApplicationContext
import kotlinx.coroutines.CoroutineDispatcher
import kotlinx.coroutines.withContext
import kotlinx.serialization.json.JsonObject
import okhttp3.ResponseBody
import java.io.File
import javax.inject.Inject
import javax.inject.Singleton

/**
 * Downloads PDFs that the API streams (with the signed-in user's token) into cache/pdfs and returns a
 * `content://` uri for [viewIntent]. All IO runs on the IO dispatcher.
 */
@Singleton
class PdfFileStore @Inject constructor(
    @ApplicationContext private val context: Context,
    private val api: PdfStreamApi,
    private val apiCaller: ApiCaller,
    @IoDispatcher private val io: CoroutineDispatcher,
) {
    /** `GET [path]` (relative, e.g. `payroll/runs/{id}/payslips-pdf`) saved as [fileName]. */
    suspend fun get(path: String, fileName: String): AppResult<String> = save(fileName) { api.get(path) }

    /** `POST [path]` with a JSON [body] saved as [fileName]. */
    suspend fun post(path: String, body: JsonObject, fileName: String): AppResult<String> = save(fileName) { api.post(path, body) }

    private suspend fun save(fileName: String, fetch: suspend () -> ResponseBody): AppResult<String> = apiCaller.call {
        val body = fetch()
        withContext(io) {
            val dir = File(context.cacheDir, DIR).apply { mkdirs() }
            val file = File(dir, safeName(fileName))
            body.use { response -> file.outputStream().use { out -> response.byteStream().copyTo(out) } }
            FileProvider.getUriForFile(context, authority(context), file).toString()
        }
    }

    private fun safeName(name: String): String {
        val cleaned = name.replace(Regex("[^A-Za-z0-9._-]"), "_").ifBlank { "document" }
        return if (cleaned.endsWith(".pdf", ignoreCase = true)) cleaned else "$cleaned.pdf"
    }

    companion object {
        private const val DIR = "pdfs"

        fun authority(context: Context): String = "${context.packageName}.schoolpdfs"

        /** Opens a uri from [get]/[post] in a PDF viewer, with read access granted. */
        fun viewIntent(uri: String): Intent = Intent(Intent.ACTION_VIEW)
            .setDataAndType(Uri.parse(uri), "application/pdf")
            .addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION or Intent.FLAG_ACTIVITY_NEW_TASK)
    }
}
