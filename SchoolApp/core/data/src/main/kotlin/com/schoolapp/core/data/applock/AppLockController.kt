package com.schoolapp.core.data.applock

import com.schoolapp.core.common.dispatcher.ApplicationScope
import com.schoolapp.core.data.auth.AuthRepository
import com.schoolapp.core.data.auth.AuthState
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.SharingStarted
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.combine
import kotlinx.coroutines.flow.distinctUntilChanged
import kotlinx.coroutines.flow.launchIn
import kotlinx.coroutines.flow.onEach
import kotlinx.coroutines.flow.stateIn
import javax.inject.Inject
import javax.inject.Singleton

/**
 * Decides when the app is locked: on a cold start and after more than five minutes in the background,
 * but only while signed in with the app lock on. Signing out (or turning the lock off) always unlocks.
 */
@Singleton
class AppLockController @Inject constructor(
    appLockRepository: AppLockRepository,
    authRepository: AuthRepository,
    private val clock: MonotonicClock,
    @ApplicationScope scope: CoroutineScope,
) {
    /** Null until the stored setting and the session have been read. */
    private val isProtected: StateFlow<Boolean?> =
        combine(appLockRepository.enabled, authRepository.authState) { enabled, auth ->
            enabled && auth is AuthState.SignedIn
        }
            .distinctUntilChanged()
            .stateIn(scope, SharingStarted.Eagerly, null)

    /** A cold start counts as a return from the background. */
    private val lockRequested = MutableStateFlow(true)

    @Volatile
    private var backgroundedAt: Long? = null

    val state: StateFlow<AppLockState> = combine(isProtected, lockRequested) { guarded, requested ->
        when (guarded) {
            null -> AppLockState.UNKNOWN
            false -> AppLockState.UNLOCKED
            true -> if (requested) AppLockState.LOCKED else AppLockState.UNLOCKED
        }
    }
        .distinctUntilChanged()
        .stateIn(scope, SharingStarted.Eagerly, AppLockState.UNKNOWN)

    init {
        // Unprotected (signed out, lock off) clears any pending lock, so turning the lock on later does not lock at once.
        isProtected.onEach { if (it == false) lockRequested.value = false }.launchIn(scope)
    }

    fun onBackground() {
        backgroundedAt = clock.nowMillis()
    }

    fun onForeground() {
        val since = backgroundedAt ?: return
        backgroundedAt = null
        if (isProtected.value == true && AppLockPolicy.expired(since, clock.nowMillis())) lockRequested.value = true
    }

    /** Called after a successful biometric / device-credential check. */
    fun unlock() {
        lockRequested.value = false
    }
}
