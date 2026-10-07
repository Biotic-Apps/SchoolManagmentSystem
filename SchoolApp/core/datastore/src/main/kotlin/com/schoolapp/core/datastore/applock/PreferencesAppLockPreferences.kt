package com.schoolapp.core.datastore.applock

import androidx.datastore.core.DataStore
import androidx.datastore.preferences.core.Preferences
import androidx.datastore.preferences.core.booleanPreferencesKey
import androidx.datastore.preferences.core.edit
import androidx.datastore.preferences.core.emptyPreferences
import com.schoolapp.core.common.dispatcher.IoDispatcher
import kotlinx.coroutines.CoroutineDispatcher
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.catch
import kotlinx.coroutines.flow.distinctUntilChanged
import kotlinx.coroutines.flow.emitAll
import kotlinx.coroutines.flow.flow
import kotlinx.coroutines.flow.flowOn
import kotlinx.coroutines.flow.map
import kotlinx.coroutines.withContext
import java.io.IOException
import javax.inject.Inject
import javax.inject.Singleton

/** A plain flag, not a secret, so it is stored unencrypted. The DataStore is created lazily on IO. */
@Singleton
internal class PreferencesAppLockPreferences @Inject constructor(
    @AppLockDataStore private val dataStore: dagger.Lazy<DataStore<Preferences>>,
    @IoDispatcher private val io: CoroutineDispatcher,
) : AppLockPreferences {

    override val enabled: Flow<Boolean> = flow { emitAll(dataStore.get().data) }
        .catch { e -> if (e is IOException) emit(emptyPreferences()) else throw e }
        .map { it[Enabled] == true }
        .distinctUntilChanged()
        .flowOn(io)

    override suspend fun setEnabled(enabled: Boolean) = withContext(io) {
        dataStore.get().edit { it[Enabled] = enabled }
        Unit
    }

    private companion object {
        val Enabled = booleanPreferencesKey("enabled")
    }
}
