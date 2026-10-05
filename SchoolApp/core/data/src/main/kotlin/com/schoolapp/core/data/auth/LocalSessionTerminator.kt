package com.schoolapp.core.data.auth

import com.schoolapp.core.database.LocalDataCleaner
import com.schoolapp.core.datastore.SessionStore
import com.schoolapp.core.network.auth.SessionInvalidator
import javax.inject.Inject

/** Clears tokens and every local table; the auth state then drops to signed-out (login screen). */
class LocalSessionTerminator @Inject constructor(
    private val sessionStore: SessionStore,
    private val localDataCleaner: LocalDataCleaner,
) : SessionInvalidator {

    override suspend fun invalidate() {
        sessionStore.clear()
        localDataCleaner.clearAll()
    }
}
