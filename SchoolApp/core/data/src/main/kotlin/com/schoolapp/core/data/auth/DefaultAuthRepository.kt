package com.schoolapp.core.data.auth

import com.schoolapp.core.common.dispatcher.DefaultDispatcher
import com.schoolapp.core.common.result.AppError
import com.schoolapp.core.common.result.AppResult
import com.schoolapp.core.common.result.map
import com.schoolapp.core.data.di.DeviceName
import com.schoolapp.core.database.LocalDataCleaner
import com.schoolapp.core.database.session.SessionCacheDao
import com.schoolapp.core.database.session.SessionCacheEntity
import com.schoolapp.core.datastore.SessionStore
import com.schoolapp.core.model.AuthTokens
import com.schoolapp.core.model.RoleRef
import com.schoolapp.core.model.SessionContext
import com.schoolapp.core.network.ApiCaller
import com.schoolapp.core.network.api.AuthApi
import com.schoolapp.core.network.api.MeApi
import com.schoolapp.core.network.dto.auth.ChangePasswordRequestDto
import com.schoolapp.core.network.dto.auth.ForgotPasswordRequestDto
import com.schoolapp.core.network.dto.auth.LoginRequestDto
import com.schoolapp.core.network.dto.auth.LoginResponseDto
import com.schoolapp.core.network.dto.auth.OtpRequestDto
import com.schoolapp.core.network.dto.auth.OtpVerifyRequestDto
import com.schoolapp.core.network.dto.auth.RefreshRequestDto
import com.schoolapp.core.network.dto.auth.ResetPasswordRequestDto
import com.schoolapp.core.network.dto.auth.TwoFactorVerifyRequestDto
import com.schoolapp.core.network.dto.me.MeDto
import com.schoolapp.core.network.model.ApiErrorCodes
import kotlinx.coroutines.CoroutineDispatcher
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.combine
import kotlinx.coroutines.flow.distinctUntilChanged
import kotlinx.coroutines.flow.first
import kotlinx.coroutines.flow.flowOn
import kotlinx.coroutines.flow.map
import kotlinx.coroutines.sync.Mutex
import kotlinx.coroutines.sync.withLock
import kotlinx.serialization.json.Json
import timber.log.Timber
import javax.inject.Inject
import javax.inject.Singleton

@Singleton
class DefaultAuthRepository @Inject constructor(
    private val authApi: AuthApi,
    private val meApi: MeApi,
    private val apiCaller: ApiCaller,
    private val sessionStore: SessionStore,
    private val sessionCacheDao: SessionCacheDao,
    private val localDataCleaner: LocalDataCleaner,
    private val terminator: LocalSessionTerminator,
    private val json: Json,
    @DeviceName private val deviceName: String,
    @DefaultDispatcher private val compute: CoroutineDispatcher,
) : AuthRepository {

    private val meMutex = Mutex()

    override val authState: Flow<AuthState> = combine(
        sessionStore.hasTokens,
        sessionStore.mustChangePassword,
        sessionCacheDao.observe(),
        sessionStore.activeChildId,
    ) { hasTokens, mustChange, cache, childId ->
        when {
            !hasTokens -> AuthState.SignedOut
            mustChange -> AuthState.PasswordChangeRequired
            cache == null -> AuthState.SignedOut
            else -> decode(cache.meJson)?.toSessionContext(childId)?.let(AuthState::SignedIn) ?: AuthState.SignedOut
        }
    }.distinctUntilChanged().flowOn(compute)

    override val session: Flow<SessionContext?> =
        authState.map { (it as? AuthState.SignedIn)?.session }.distinctUntilChanged()

    override suspend fun login(identifier: String, password: String): AppResult<LoginOutcome> {
        val request = LoginRequestDto(identifier.trim(), password, LoginRequestDto.PLATFORM_ANDROID, deviceName)
        return when (val result = apiCaller.call { authApi.login(request).data }) {
            is AppResult.Failure -> result
            is AppResult.Success -> completeSignIn(result.data)
        }
    }

    override suspend fun requestOtp(email: String): AppResult<Int> =
        apiCaller.call { authApi.requestOtp(OtpRequestDto(email.trim().lowercase())).data }.map { it.resendAfterSeconds }

    override suspend fun verifyOtp(email: String, code: String): AppResult<LoginOutcome> {
        val request = OtpVerifyRequestDto(email.trim().lowercase(), code.trim(), LoginRequestDto.PLATFORM_ANDROID, deviceName)
        return when (val result = apiCaller.call { authApi.verifyOtp(request).data }) {
            is AppResult.Failure -> result
            is AppResult.Success -> completeSignIn(result.data)
        }
    }

    /** Shared by password and email-code sign-in: same `LoginResult` body (tokens or a 2FA challenge). */
    private suspend fun completeSignIn(response: LoginResponseDto): AppResult<LoginOutcome> {
        if (response.twoFactorRequired) {
            val challengeId = response.challengeId?.takeIf { it.isNotBlank() }
                ?: return AppResult.Failure(AppError.Unknown(IllegalStateException("2FA challenge without id")))
            return AppResult.Success(LoginOutcome.TwoFactorRequired(challengeId))
        }
        val access = response.accessToken
        val refresh = response.refreshToken
        if (access.isNullOrBlank() || refresh.isNullOrBlank()) {
            return AppResult.Failure(AppError.Unknown(IllegalStateException("Login response without tokens")))
        }
        return startSession(AuthTokens(access, refresh), response.mustChangePassword).map { LoginOutcome.SignedIn }
    }

    override suspend fun verifyTwoFactor(challengeId: String, code: String): AppResult<Unit> {
        val body = TwoFactorVerifyRequestDto(challengeId, code)
        val tokens = when (val result = apiCaller.call { authApi.verifyTwoFactor(body).data }) {
            is AppResult.Failure -> return result
            is AppResult.Success -> result.data
        }
        return startSession(AuthTokens(tokens.accessToken, tokens.refreshToken), tokens.mustChangePassword)
    }

    override suspend fun requestPasswordReset(identifier: String): AppResult<Unit> =
        apiCaller.call { authApi.forgotPassword(ForgotPasswordRequestDto(identifier.trim())) }

    override suspend fun resetPassword(token: String, newPassword: String): AppResult<Unit> =
        apiCaller.call { authApi.resetPassword(ResetPasswordRequestDto(token.trim(), newPassword)) }

    /** Stores fresh tokens and loads `/me`; shared by password sign-in and the 2FA step. */
    private suspend fun startSession(tokens: AuthTokens, mustChangePassword: Boolean): AppResult<Unit> {
        sessionStore.setActiveRole(null)
        sessionStore.setMustChangePassword(mustChangePassword)
        sessionStore.saveTokens(tokens)
        return when (val me = loadMe(isNewLogin = true)) {
            is AppResult.Success -> AppResult.Success(Unit)
            is AppResult.Failure -> if (me.error.code == ApiErrorCodes.PASSWORD_CHANGE_REQUIRED) {
                sessionStore.setMustChangePassword(true)
                AppResult.Success(Unit)
            } else {
                sessionStore.clear()
                me
            }
        }
    }

    override suspend fun refreshSession(): AppResult<Unit> {
        if (sessionStore.tokens() == null) return AppResult.Failure(AppError.Unauthorized)
        var result = loadMe(isNewLogin = false)
        if (result is AppResult.Failure && result.error.code == ApiErrorCodes.FORBIDDEN &&
            sessionStore.activeRole.first() != null
        ) {
            // The stored role may have been removed; let the server pick the default context.
            sessionStore.setActiveRole(null)
            result = loadMe(isNewLogin = false)
        }
        if (result is AppResult.Failure) handleRefreshFailure(result.error)
        return result.map { }
    }

    override suspend fun switchRole(role: RoleRef): AppResult<Unit> {
        val previous = sessionStore.activeRole.first()
        sessionStore.setActiveRole(role)
        val result = loadMe(isNewLogin = false)
        if (result is AppResult.Failure) sessionStore.setActiveRole(previous)
        return result.map { }
    }

    override suspend fun selectChild(childId: String) = sessionStore.setActiveChild(childId)

    override suspend fun changePassword(currentPassword: String, newPassword: String): AppResult<Unit> {
        val body = ChangePasswordRequestDto(currentPassword, newPassword)
        val result = apiCaller.call { authApi.changePassword(body) }
        if (result is AppResult.Failure) return result
        sessionStore.setMustChangePassword(false)
        return when (val me = loadMe(isNewLogin = false)) {
            is AppResult.Success -> AppResult.Success(Unit)
            is AppResult.Failure -> {
                if (sessionCacheDao.get() == null) terminator.invalidate()
                AppResult.Success(Unit).also { Timber.i("Profile reload after password change failed: %s", me.error) }
            }
        }
    }

    override suspend fun logout() {
        sessionStore.tokens()?.let { tokens ->
            apiCaller.call { authApi.logout(RefreshRequestDto(tokens.refreshToken)) }
                .let { if (it is AppResult.Failure) Timber.i("Server logout failed: %s", it.error) }
        }
        terminator.invalidate()
    }

    override suspend fun logoutAll(): AppResult<Unit> {
        val result = apiCaller.call { authApi.logoutAll() }
        if (result is AppResult.Success) terminator.invalidate()
        return result
    }

    private suspend fun handleRefreshFailure(error: AppError) {
        when {
            error == AppError.Unauthorized || error.code == ApiErrorCodes.ACCOUNT_DISABLED -> terminator.invalidate()
            error.code == ApiErrorCodes.PASSWORD_CHANGE_REQUIRED -> sessionStore.setMustChangePassword(true)
            else -> Timber.i("Session refresh failed, keeping cached session: %s", error)
        }
    }

    private suspend fun loadMe(isNewLogin: Boolean): AppResult<SessionContext> = meMutex.withLock {
        val me = when (val result = apiCaller.call { meApi.me().data }) {
            is AppResult.Failure -> return@withLock result
            is AppResult.Success -> result.data
        }
        val context = me.toSessionContext(sessionStore.activeChildId.first())
            ?: return@withLock AppResult.Failure(AppError.Forbidden(NO_ROLE))
        val previous = sessionCacheDao.get()
        if (isNewLogin && previous != null && previous.userId != me.user.id) localDataCleaner.clearAll()

        sessionStore.setActiveRole(context.activeRole)
        context.activeChildId?.let { sessionStore.setActiveChild(it) }
        sessionStore.setMustChangePassword(me.user.mustChangePassword)
        sessionCacheDao.upsert(
            SessionCacheEntity(
                userId = me.user.id,
                meJson = json.encodeToString(MeDto.serializer(), me),
                updatedAt = System.currentTimeMillis(),
            ),
        )
        AppResult.Success(context)
    }

    private fun decode(raw: String): MeDto? =
        runCatching { json.decodeFromString(MeDto.serializer(), raw) }
            .onFailure { Timber.w(it, "Cached session is unreadable") }
            .getOrNull()

    companion object {
        const val NO_ROLE = "NO_ROLE"
    }
}
