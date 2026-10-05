package com.schoolapp.core.data.auth

import com.schoolapp.core.model.SessionContext

sealed interface AuthState {
    data object SignedOut : AuthState

    /** Signed in but the server requires a new password before anything else. */
    data object PasswordChangeRequired : AuthState

    data class SignedIn(val session: SessionContext) : AuthState
}
