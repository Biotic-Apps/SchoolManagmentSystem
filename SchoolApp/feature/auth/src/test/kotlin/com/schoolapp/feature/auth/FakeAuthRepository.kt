package com.schoolapp.feature.auth

import com.schoolapp.core.common.result.AppError
import com.schoolapp.core.common.result.AppResult
import com.schoolapp.core.data.auth.AuthRepository
import com.schoolapp.core.data.auth.AuthState
import com.schoolapp.core.data.auth.LoginOutcome
import com.schoolapp.core.model.RoleAssignment
import com.schoolapp.core.model.RoleKey
import com.schoolapp.core.model.RoleRef
import com.schoolapp.core.model.ScopeType
import com.schoolapp.core.model.SessionContext
import com.schoolapp.core.model.User
import kotlinx.coroutines.CompletableDeferred
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.map

class FakeAuthRepository : AuthRepository {
    val sessionState = MutableStateFlow<SessionContext?>(null)
    val loginCalls = mutableListOf<Pair<String, String>>()
    val verifyCalls = mutableListOf<Pair<String, String>>()
    val resetRequests = mutableListOf<String>()
    val resetCalls = mutableListOf<Pair<String, String>>()
    var nextError: AppError? = null
    var challengeId: String? = null
    var gate: CompletableDeferred<Unit>? = null
    val otpRequests = mutableListOf<String>()
    val otpVerifyCalls = mutableListOf<Pair<String, String>>()
    var resendAfterSeconds = 60

    override suspend fun requestOtp(email: String): AppResult<Int> {
        otpRequests += email
        gate?.await()
        return nextError?.let { AppResult.Failure(it) } ?: AppResult.Success(resendAfterSeconds)
    }

    override suspend fun verifyOtp(email: String, code: String): AppResult<LoginOutcome> {
        otpVerifyCalls += email to code
        gate?.await()
        nextError?.let { return AppResult.Failure(it) }
        challengeId?.let { return AppResult.Success(LoginOutcome.TwoFactorRequired(it)) }
        signIn()
        return AppResult.Success(LoginOutcome.SignedIn)
    }

    override val authState: Flow<AuthState> =
        sessionState.map { it?.let(AuthState::SignedIn) ?: AuthState.SignedOut }

    override val session: Flow<SessionContext?> = sessionState

    override suspend fun login(identifier: String, password: String): AppResult<LoginOutcome> {
        loginCalls += identifier to password
        gate?.await()
        nextError?.let { return AppResult.Failure(it) }
        challengeId?.let { return AppResult.Success(LoginOutcome.TwoFactorRequired(it)) }
        signIn()
        return AppResult.Success(LoginOutcome.SignedIn)
    }

    override suspend fun verifyTwoFactor(challengeId: String, code: String): AppResult<Unit> {
        verifyCalls += challengeId to code
        gate?.await()
        nextError?.let { return AppResult.Failure(it) }
        signIn()
        return AppResult.Success(Unit)
    }

    override suspend fun requestPasswordReset(identifier: String): AppResult<Unit> {
        resetRequests += identifier
        gate?.await()
        return nextError?.let { AppResult.Failure(it) } ?: AppResult.Success(Unit)
    }

    override suspend fun resetPassword(token: String, newPassword: String): AppResult<Unit> {
        resetCalls += token to newPassword
        gate?.await()
        return nextError?.let { AppResult.Failure(it) } ?: AppResult.Success(Unit)
    }

    override suspend fun refreshSession(): AppResult<Unit> =
        if (sessionState.value != null) AppResult.Success(Unit) else AppResult.Failure(AppError.Unauthorized)

    override suspend fun switchRole(role: RoleRef): AppResult<Unit> = refreshSession()

    override suspend fun selectChild(childId: String) = Unit

    override suspend fun changePassword(currentPassword: String, newPassword: String): AppResult<Unit> =
        AppResult.Success(Unit)

    override suspend fun logout() {
        sessionState.value = null
    }

    override suspend fun logoutAll(): AppResult<Unit> = AppResult.Success(Unit).also { logout() }

    private fun signIn() {
        sessionState.value = SessionContext(
            user = User("u1", "Sara Ali"),
            assignments = listOf(RoleAssignment("a1", RoleKey.TEACHER, ScopeType.SECTION)),
            activeRole = RoleKey.TEACHER,
            permissions = emptySet(),
        )
    }
}
