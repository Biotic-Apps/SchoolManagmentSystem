package com.schoolapp.core.network.pending

/** Replays an offline-queued JSON request with its idempotency key. */
fun interface PendingRequestSender {
    suspend fun send(method: String, path: String, jsonBody: String, idempotencyKey: String): SendResult
}
