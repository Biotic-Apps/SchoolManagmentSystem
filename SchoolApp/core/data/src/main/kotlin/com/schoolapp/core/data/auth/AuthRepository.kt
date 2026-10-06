package com.schoolapp.core.data.auth

import com.schoolapp.core.common.result.AppResult
import com.schoolapp.core.model.RoleRef
import com.schoolapp.core.model.SessionContext
import kotlinx.coroutines.flow.Flow

interface AuthRepository {
    val authState: Flow<AuthState>

    /** Current signed-in context, or null when signed out or a password change is pending. */
    val session: Flow<SessionContext?>

    suspend fun login(identifier: String, password: String): AppResult<LoginOutcome>

    /** Completes a [LoginOutcome.TwoFactorRequired] sign-in with a TOTP or recovery [code]. */
    suspend fun verifyTwoFactor(challengeId: String, code: String): AppResult<Unit>

    /** Always answers neutrally on the server side; the caller must not reveal whether the account exists. */
    suspend fun requestPasswordReset(identifier: String): AppResult<Unit>

    suspend fun resetPassword(token: String, newPassword: String): AppResult<Unit>

    /** Re-fetches `/me` so role/permission changes apply; ends the session if the server rejects it. */
    suspend fun refreshSession(): AppResult<Unit>

    /** Sends `X-Active-Role` for [role] and reloads `/me`; the previous role is kept on failure. */
    suspend fun switchRole(role: RoleRef): AppResult<Unit>

    suspend fun selectChild(childId: String)

    suspend fun changePassword(currentPassword: String, newPassword: String): AppResult<Unit>

    suspend fun logout()

    suspend fun logoutAll(): AppResult<Unit>
}
