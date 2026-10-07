package com.schoolapp.core.data.applock

import com.schoolapp.core.datastore.applock.AppLockPreferences
import kotlinx.coroutines.flow.Flow
import javax.inject.Inject
import javax.inject.Singleton

@Singleton
class DefaultAppLockRepository @Inject constructor(
    private val preferences: AppLockPreferences,
    private val checker: DeviceLockChecker,
) : AppLockRepository {

    override val enabled: Flow<Boolean> = preferences.enabled

    override suspend fun availability(): AppLockAvailability = checker.availability()

    override suspend fun setEnabled(enabled: Boolean): Boolean {
        if (enabled && checker.availability() != AppLockAvailability.AVAILABLE) return false
        preferences.setEnabled(enabled)
        return true
    }
}
