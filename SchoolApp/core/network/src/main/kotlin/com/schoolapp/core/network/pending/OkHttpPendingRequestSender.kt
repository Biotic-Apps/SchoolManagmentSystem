package com.schoolapp.core.network.pending

import com.schoolapp.core.common.dispatcher.IoDispatcher
import com.schoolapp.core.network.AuthHeaders
import com.schoolapp.core.network.di.ApiBaseUrl
import com.schoolapp.core.network.di.AuthClient
import kotlinx.coroutines.CoroutineDispatcher
import kotlinx.coroutines.withContext
import okhttp3.HttpUrl.Companion.toHttpUrl
import okhttp3.MediaType.Companion.toMediaType
import okhttp3.OkHttpClient
import okhttp3.Request
import okhttp3.RequestBody.Companion.toRequestBody
import java.io.IOException
import javax.inject.Inject

internal class OkHttpPendingRequestSender @Inject constructor(
    @AuthClient private val client: OkHttpClient,
    @ApiBaseUrl private val baseUrl: String,
    @IoDispatcher private val io: CoroutineDispatcher,
) : PendingRequestSender {

    override suspend fun send(method: String, path: String, jsonBody: String, idempotencyKey: String): SendResult =
        withContext(io) {
            val url = baseUrl.toHttpUrl().resolve(path.trimStart('/'))
                ?: return@withContext SendResult.Rejected(0, "Invalid path")
            val body = if (method.uppercase() in BODILESS) null else jsonBody.toRequestBody(JSON)
            val request = Request.Builder()
                .url(url)
                .method(method.uppercase(), body)
                .header(AuthHeaders.IDEMPOTENCY_KEY, idempotencyKey)
                .build()
            try {
                client.newCall(request).execute().use { response ->
                    when {
                        response.isSuccessful -> SendResult.Sent(response.body.string().ifEmpty { null })
                        response.code in RETRYABLE || response.code >= 500 -> SendResult.Retry("HTTP ${response.code}")
                        else -> SendResult.Rejected(response.code, response.body.string().take(MAX_ERROR_LENGTH))
                    }
                }
            } catch (e: IOException) {
                SendResult.Retry(e.message)
            }
        }

    private companion object {
        val JSON = "application/json; charset=utf-8".toMediaType()
        val BODILESS = setOf("GET", "DELETE")
        val RETRYABLE = setOf(401, 408, 429)
        const val MAX_ERROR_LENGTH = 500
    }
}
