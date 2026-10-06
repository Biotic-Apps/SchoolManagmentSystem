package com.schoolapp.core.testing

import com.schoolapp.core.common.result.AppError
import com.schoolapp.core.common.result.AppResult
import com.schoolapp.core.data.auth.AuthRepository
import com.schoolapp.core.data.auth.AuthState
import com.schoolapp.core.model.RoleRef
import com.schoolapp.core.model.SessionContext
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.map

class FakeAuthRepository(initial: SessionContext? = null) : AuthRepository {
    val sessionState = MutableStateFlow(initial)
    val changePasswordCalls = mutableListOf<Pair<String, String>>()
    var nextError: AppError? = null
    var refreshCalls = 0

    override val authState: Flow<AuthState> =
        sessionState.map { it?.let(AuthState::SignedIn) ?: AuthState.SignedOut }

    override val session: Flow<SessionContext?> = sessionState

    override suspend fun login(identifier: String, password: String): AppResult<Unit> = result()

    override suspend fun refreshSession(): AppResult<Unit> {
        refreshCalls++
        return result()
    }

    override suspend fun switchRole(role: RoleRef): AppResult<Unit> = result()

    override suspend fun selectChild(childId: String) {
        sessionState.value = sessionState.value?.copy(activeChildId = childId)
    }

    override suspend fun changePassword(currentPassword: String, newPassword: String): AppResult<Unit> {
        changePasswordCalls += currentPassword to newPassword
        return result()
    }

    override suspend fun logout() {
        sessionState.value = null
    }

    override suspend fun logoutAll(): AppResult<Unit> = result().also {
        if (it is AppResult.Success) sessionState.value = null
    }

    private fun result(): AppResult<Unit> = nextError?.let { AppResult.Failure(it) } ?: AppResult.Success(Unit)
}
