package com.schoolapp.demo

import com.schoolapp.core.common.result.AppResult
import com.schoolapp.core.data.auth.AuthRepository
import com.schoolapp.core.data.auth.AuthState
import com.schoolapp.core.data.auth.DefaultAuthRepository
import com.schoolapp.core.data.auth.LoginOutcome
import com.schoolapp.core.model.RoleRef
import com.schoolapp.core.model.SessionContext
import com.schoolapp.core.model.User
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.combine
import kotlinx.coroutines.flow.distinctUntilChanged
import kotlinx.coroutines.flow.map
import kotlinx.coroutines.flow.update
import javax.inject.Inject
import javax.inject.Singleton

/** Wraps the real repository; while a demo session is active it takes precedence and stays in memory. */
@Singleton
class DemoAwareAuthRepository @Inject constructor(
    private val real: DefaultAuthRepository,
) : AuthRepository {

    private val demo = MutableStateFlow<SessionContext?>(null)

    val demoSession: StateFlow<SessionContext?> = demo.asStateFlow()
    val isDemoActive: Boolean get() = demo.value != null
    val demoActive: Flow<Boolean> = demo.map { it != null }.distinctUntilChanged()

    override val authState: Flow<AuthState> = combine(demo, real.authState) { demoSession, realState ->
        demoSession?.let(AuthState::SignedIn) ?: realState
    }

    override val session: Flow<SessionContext?> =
        authState.map { (it as? AuthState.SignedIn)?.session }.distinctUntilChanged()

    fun startDemo(role: RoleRef) {
        demo.value = DemoSessions.forRole(role)
    }

    fun updateDemoUser(transform: (User) -> User) = demo.update { it?.copy(user = transform(it.user)) }

    override suspend fun login(identifier: String, password: String): AppResult<LoginOutcome> {
        demo.value = null
        return real.login(identifier, password)
    }

    override suspend fun verifyTwoFactor(challengeId: String, code: String): AppResult<Unit> =
        if (isDemoActive) AppResult.Success(Unit) else real.verifyTwoFactor(challengeId, code)

    override suspend fun requestPasswordReset(identifier: String): AppResult<Unit> =
        real.requestPasswordReset(identifier)

    override suspend fun resetPassword(token: String, newPassword: String): AppResult<Unit> =
        if (isDemoActive) AppResult.Success(Unit) else real.resetPassword(token, newPassword)

    override suspend fun refreshSession(): AppResult<Unit> =
        if (isDemoActive) AppResult.Success(Unit) else real.refreshSession()

    override suspend fun switchRole(role: RoleRef): AppResult<Unit> {
        val current = demo.value ?: return real.switchRole(role)
        demo.value = DemoSessions.forRole(role, current.activeChildId, current.user)
        return AppResult.Success(Unit)
    }

    override suspend fun selectChild(childId: String) {
        if (demo.value == null) real.selectChild(childId) else demo.update { it?.copy(activeChildId = childId) }
    }

    override suspend fun changePassword(currentPassword: String, newPassword: String): AppResult<Unit> =
        if (isDemoActive) AppResult.Success(Unit) else real.changePassword(currentPassword, newPassword)

    override suspend fun logout() {
        if (demo.value != null) demo.value = null else real.logout()
    }

    override suspend fun logoutAll(): AppResult<Unit> {
        if (demo.value == null) return real.logoutAll()
        demo.value = null
        return AppResult.Success(Unit)
    }
}
