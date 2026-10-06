package com.schoolapp.core.data.auth

/** Result of a password sign-in: either signed in, or a second step (TOTP / recovery code) is needed. */
sealed interface LoginOutcome {
    data object SignedIn : LoginOutcome

    data class TwoFactorRequired(val challengeId: String) : LoginOutcome
}
