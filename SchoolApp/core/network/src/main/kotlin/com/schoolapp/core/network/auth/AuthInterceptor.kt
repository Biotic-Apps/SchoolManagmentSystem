package com.schoolapp.core.network.auth

import com.schoolapp.core.datastore.SessionStore
import com.schoolapp.core.network.AuthHeaders
import kotlinx.coroutines.flow.first
import kotlinx.coroutines.runBlocking
import okhttp3.Interceptor
import okhttp3.Response
import javax.inject.Inject

/** Adds bearer token and `X-Active-Role`. Runs on OkHttp worker threads, never on the main thread. */
class AuthInterceptor @Inject constructor(
    private val sessionStore: SessionStore,
) : Interceptor {

    override fun intercept(chain: Interceptor.Chain): Response {
        val original = chain.request()
        if (original.header(AuthHeaders.SKIP_AUTH) != null) {
            return chain.proceed(original.newBuilder().removeHeader(AuthHeaders.SKIP_AUTH).build())
        }
        val (tokens, role) = runBlocking { sessionStore.tokens() to sessionStore.activeRole.first() }
        val request = original.newBuilder().apply {
            tokens?.let { header(AuthHeaders.AUTHORIZATION, AuthHeaders.bearer(it.accessToken)) }
            role?.let { header(AuthHeaders.ACTIVE_ROLE, it.key) }
        }.build()
        return chain.proceed(request)
    }
}
