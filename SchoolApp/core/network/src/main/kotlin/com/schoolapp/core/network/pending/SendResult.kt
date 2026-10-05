package com.schoolapp.core.network.pending

sealed interface SendResult {
    data object Sent : SendResult
    data class Retry(val reason: String?) : SendResult
    data class Rejected(val httpCode: Int, val reason: String?) : SendResult
}
