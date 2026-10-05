package com.schoolapp.core.network.auth

import com.schoolapp.core.datastore.SessionStore
import com.schoolapp.core.network.AuthHeaders
import com.schoolapp.core.network.model.ApiErrorCodes
import kotlinx.coroutines.runBlocking
import kotlinx.coroutines.sync.Mutex
import kotlinx.coroutines.sync.withLock
import okhttp3.Authenticator
import okhttp3.Request
import okhttp3.Response
import okhttp3.Route
import javax.inject.Inject
import javax.inject.Singleton

/**
 * On 401, rotates tokens once via `/auth/refresh` and retries. Concurrent 401s share one refresh:
 * whoever waits on the mutex sees the rotated token and retries with it. A rejected refresh
 * ends the local session so the app returns to login.
 */
@Singleton
class TokenAuthenticator @Inject constructor(
    private val sessionStore: SessionStore,
    private val refresher: TokenRefresher,
    private val invalidator: SessionInvalidator,
) : Authenticator {

    private val mutex = Mutex()

    override fun authenticate(route: Route?, response: Response): Request? {
        val sentAuth = response.request.header(AuthHeaders.AUTHORIZATION) ?: return null
        if (response.priorCount() >= MAX_RETRIES || response.isCredentialError()) return null

        return runBlocking {
            mutex.withLock {
                val current = sessionStore.tokens() ?: return@withLock null
                if (sentAuth != AuthHeaders.bearer(current.accessToken)) {
                    return@withLock response.request.withToken(current.accessToken)
                }
                when (val outcome = refresher.refresh(current.refreshToken)) {
                    is RefreshOutcome.Refreshed -> {
                        sessionStore.saveTokens(outcome.tokens)
                        response.request.withToken(outcome.tokens.accessToken)
                    }
                    RefreshOutcome.Rejected -> {
                        invalidator.invalidate()
                        null
                    }
                    RefreshOutcome.Unavailable -> null
                }
            }
        }
    }

    /** A wrong current password (e.g. on change-password) is not an expired token. */
    private fun Response.isCredentialError(): Boolean =
        runCatching { peekBody(PEEK_BYTES).string().contains(ApiErrorCodes.INVALID_CREDENTIALS) }.getOrDefault(false)

    private fun Request.withToken(token: String): Request =
        newBuilder().header(AuthHeaders.AUTHORIZATION, AuthHeaders.bearer(token)).build()

    private fun Response.priorCount(): Int {
        var count = 0
        var prior = priorResponse
        while (prior != null) {
            count++
            prior = prior.priorResponse
        }
        return count
    }

    private companion object {
        const val MAX_RETRIES = 2
        const val PEEK_BYTES = 2048L
    }
}
