package com.schoolapp.core.network.auth

import com.schoolapp.core.model.AuthTokens
import okhttp3.Protocol
import okhttp3.Request
import okhttp3.Response
import okhttp3.ResponseBody.Companion.toResponseBody
import org.junit.Assert.assertEquals
import org.junit.Assert.assertNull
import org.junit.Test
import java.util.concurrent.CountDownLatch
import java.util.concurrent.Executors
import java.util.concurrent.TimeUnit
import java.util.concurrent.atomic.AtomicInteger

class TokenAuthenticatorTest {

    private val old = AuthTokens("old-access", "old-refresh")
    private val rotated = AuthTokens("new-access", "new-refresh")
    private val store = FakeSessionStore(old)
    private var invalidations = 0
    private val invalidator = SessionInvalidator { invalidations++ }

    private fun unauthorized(token: String?, code: String = "UNAUTHENTICATED"): Response {
        val request = Request.Builder().url("http://localhost/api/v1/me")
            .apply { token?.let { header("Authorization", "Bearer $it") } }
            .build()
        return Response.Builder()
            .request(request)
            .protocol(Protocol.HTTP_1_1)
            .code(401)
            .message("Unauthorized")
            .body("""{"error":{"code":"$code","message":"x"}}""".toResponseBody())
            .build()
    }

    @Test
    fun refreshes_once_and_retries_with_rotated_token() {
        val authenticator = TokenAuthenticator(store, { RefreshOutcome.Refreshed(rotated) }, invalidator)
        val retry = authenticator.authenticate(null, unauthorized(old.accessToken))
        assertEquals("Bearer new-access", retry?.header("Authorization"))
        assertEquals(rotated, kotlinx.coroutines.runBlocking { store.tokens() })
    }

    @Test
    fun concurrent_401s_share_a_single_refresh() {
        val refreshCalls = AtomicInteger()
        val refresher = TokenRefresher {
            refreshCalls.incrementAndGet()
            Thread.sleep(200)
            RefreshOutcome.Refreshed(rotated)
        }
        val authenticator = TokenAuthenticator(store, refresher, invalidator)
        val pool = Executors.newFixedThreadPool(4)
        val start = CountDownLatch(1)
        val results = (1..4).map {
            pool.submit<Request?> {
                start.await()
                authenticator.authenticate(null, unauthorized(old.accessToken))
            }
        }
        start.countDown()
        val headers = results.map { it.get(5, TimeUnit.SECONDS)?.header("Authorization") }
        pool.shutdown()

        assertEquals(1, refreshCalls.get())
        assertEquals(List(4) { "Bearer new-access" }, headers)
    }

    @Test
    fun rejected_refresh_ends_the_session() {
        val authenticator = TokenAuthenticator(store, { RefreshOutcome.Rejected }, invalidator)
        assertNull(authenticator.authenticate(null, unauthorized(old.accessToken, "SESSION_REVOKED")))
        assertEquals(1, invalidations)
    }

    @Test
    fun unavailable_refresh_keeps_the_session() {
        val authenticator = TokenAuthenticator(store, { RefreshOutcome.Unavailable }, invalidator)
        assertNull(authenticator.authenticate(null, unauthorized(old.accessToken)))
        assertEquals(0, invalidations)
        assertEquals(old, kotlinx.coroutines.runBlocking { store.tokens() })
    }

    @Test
    fun wrong_password_and_anonymous_requests_are_not_refreshed() {
        val refreshCalls = AtomicInteger()
        val authenticator = TokenAuthenticator(store, {
            refreshCalls.incrementAndGet()
            RefreshOutcome.Refreshed(rotated)
        }, invalidator)
        assertNull(authenticator.authenticate(null, unauthorized(old.accessToken, "INVALID_CREDENTIALS")))
        assertNull(authenticator.authenticate(null, unauthorized(token = null)))
        assertEquals(0, refreshCalls.get())
    }
}
