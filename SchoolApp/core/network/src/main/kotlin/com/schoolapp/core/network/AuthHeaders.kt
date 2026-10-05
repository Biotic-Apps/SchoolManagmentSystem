package com.schoolapp.core.network

object AuthHeaders {
    const val AUTHORIZATION = "Authorization"
    const val ACTIVE_ROLE = "X-Active-Role"
    const val IDEMPOTENCY_KEY = "Idempotency-Key"

    /** Marker header stripped by the interceptor; requests carrying it are sent without a token. */
    const val SKIP_AUTH = "X-Skip-Auth"

    fun bearer(token: String) = "Bearer $token"
}
