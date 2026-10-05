package com.schoolapp.core.network.auth

/** Ends the local session (tokens and cached data) after the server rejects it. Implemented in :core:data. */
fun interface SessionInvalidator {
    suspend fun invalidate()
}
