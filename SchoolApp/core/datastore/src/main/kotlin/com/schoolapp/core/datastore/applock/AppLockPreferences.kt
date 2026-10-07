package com.schoolapp.core.datastore.applock

import kotlinx.coroutines.flow.Flow

/** Whether the optional biometric / screen-lock app lock is on for this device (security.md §8). Off by default. */
interface AppLockPreferences {
    val enabled: Flow<Boolean>

    suspend fun setEnabled(enabled: Boolean)
}
