package com.schoolapp.core.network.pending

sealed interface SendResult {
    /** Accepted by the server; [body] is the raw response JSON (used to resolve ids for dependent requests). */
    data class Sent(val body: String? = null) : SendResult
    data class Retry(val reason: String?) : SendResult
    data class Rejected(val httpCode: Int, val reason: String?) : SendResult
}
