package com.schoolapp.core.data.applock

/** Asks the OS whether [AppLockAuthenticators.allowed] can be used right now. */
fun interface DeviceLockChecker {
    suspend fun availability(): AppLockAvailability
}
