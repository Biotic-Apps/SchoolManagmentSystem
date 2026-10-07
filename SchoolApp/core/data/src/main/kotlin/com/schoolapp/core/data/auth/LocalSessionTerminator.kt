package com.schoolapp.core.data.auth

import com.schoolapp.core.database.LocalDataCleaner
import com.schoolapp.core.datastore.SessionStore
import com.schoolapp.core.datastore.applock.AppLockPreferences
import com.schoolapp.core.network.auth.SessionInvalidator
import javax.inject.Inject

/**
 * Clears tokens, every local table and the app-lock setting (the next person to sign in chooses
 * their own); the auth state then drops to signed-out (login screen).
 */
class LocalSessionTerminator @Inject constructor(
    private val sessionStore: SessionStore,
    private val localDataCleaner: LocalDataCleaner,
    private val appLockPreferences: AppLockPreferences,
) : SessionInvalidator {

    override suspend fun invalidate() {
        sessionStore.clear()
        localDataCleaner.clearAll()
        appLockPreferences.setEnabled(false)
    }
}
