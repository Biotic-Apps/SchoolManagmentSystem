package com.schoolapp.core.network.auth

/** Blocking refresh-token rotation; called only from [TokenAuthenticator] on OkHttp threads. */
fun interface TokenRefresher {
    fun refresh(refreshToken: String): RefreshOutcome
}
