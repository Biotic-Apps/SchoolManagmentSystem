package com.schoolapp.core.datastore

import androidx.datastore.core.DataStore
import androidx.datastore.preferences.core.Preferences
import androidx.datastore.preferences.core.edit
import com.schoolapp.core.common.dispatcher.IoDispatcher
import com.schoolapp.core.datastore.crypto.StringCipher
import com.schoolapp.core.model.AuthTokens
import com.schoolapp.core.model.RoleRef
import kotlinx.coroutines.CoroutineDispatcher
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.distinctUntilChanged
import kotlinx.coroutines.flow.first
import kotlinx.coroutines.flow.flowOn
import kotlinx.coroutines.flow.map
import kotlinx.coroutines.withContext
import javax.inject.Inject
import javax.inject.Singleton

@Singleton
internal class EncryptedSessionStore @Inject constructor(
    @SessionDataStore private val dataStore: DataStore<Preferences>,
    private val cipher: StringCipher,
    @IoDispatcher private val io: CoroutineDispatcher,
) : SessionStore {

    @Volatile
    private var cachedTokens: AuthTokens? = null

    override val hasTokens: Flow<Boolean> = dataStore.data
        .map { it[SessionKeys.AccessToken] != null && it[SessionKeys.RefreshToken] != null }
        .distinctUntilChanged()

    override val activeRole: Flow<RoleRef?> = dataStore.data
        .map { prefs -> prefs.decrypted(SessionKeys.ActiveRole)?.let(RoleRef::of) }
        .distinctUntilChanged()
        .flowOn(io)

    override val activeChildId: Flow<String?> = dataStore.data
        .map { prefs -> prefs.decrypted(SessionKeys.ActiveChild) }
        .distinctUntilChanged()
        .flowOn(io)

    override val mustChangePassword: Flow<Boolean> = dataStore.data
        .map { it[SessionKeys.MustChangePassword] == true }
        .distinctUntilChanged()

    override suspend fun tokens(): AuthTokens? = cachedTokens ?: withContext(io) {
        val prefs = dataStore.data.first()
        val access = prefs.decrypted(SessionKeys.AccessToken)
        val refresh = prefs.decrypted(SessionKeys.RefreshToken)
        if (access != null && refresh != null) AuthTokens(access, refresh).also { cachedTokens = it } else null
    }

    override suspend fun saveTokens(tokens: AuthTokens) = withContext(io) {
        dataStore.edit {
            it[SessionKeys.AccessToken] = cipher.encrypt(tokens.accessToken)
            it[SessionKeys.RefreshToken] = cipher.encrypt(tokens.refreshToken)
        }
        cachedTokens = tokens
    }

    override suspend fun setActiveRole(role: RoleRef?) = withContext(io) {
        dataStore.edit {
            if (role == null) it.remove(SessionKeys.ActiveRole) else it[SessionKeys.ActiveRole] = cipher.encrypt(role.key)
        }
        Unit
    }

    override suspend fun setActiveChild(childId: String?) = withContext(io) {
        dataStore.edit {
            if (childId == null) it.remove(SessionKeys.ActiveChild) else it[SessionKeys.ActiveChild] = cipher.encrypt(childId)
        }
        Unit
    }

    override suspend fun setMustChangePassword(required: Boolean) = withContext(io) {
        dataStore.edit { it[SessionKeys.MustChangePassword] = required }
        Unit
    }

    override suspend fun clear() = withContext(io) {
        cachedTokens = null
        dataStore.edit { it.clear() }
        Unit
    }

    private fun Preferences.decrypted(key: Preferences.Key<String>): String? =
        this[key]?.let(cipher::decrypt)
}
