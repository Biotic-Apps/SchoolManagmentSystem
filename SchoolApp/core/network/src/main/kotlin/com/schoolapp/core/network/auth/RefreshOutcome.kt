package com.schoolapp.core.network.auth

import com.schoolapp.core.model.AuthTokens

sealed interface RefreshOutcome {
    data class Refreshed(val tokens: AuthTokens) : RefreshOutcome

    /** The server refused the refresh token (expired, revoked, reused, account disabled). */
    data object Rejected : RefreshOutcome

    /** Offline or server error; the session is kept and the request fails normally. */
    data object Unavailable : RefreshOutcome
}
