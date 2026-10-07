package com.schoolapp.core.data.applock

import kotlinx.coroutines.flow.Flow

/** Optional app lock (security.md §8): a device setting, cleared on sign-out. */
interface AppLockRepository {
    val enabled: Flow<Boolean>

    suspend fun availability(): AppLockAvailability

    /** Turning on is refused (false) when the device has no usable lock. */
    suspend fun setEnabled(enabled: Boolean): Boolean
}
