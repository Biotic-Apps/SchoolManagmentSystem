package com.schoolapp.core.network.auth

import com.schoolapp.core.datastore.SessionStore
import com.schoolapp.core.model.AuthTokens
import com.schoolapp.core.model.RoleRef
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.map

class FakeSessionStore(initial: AuthTokens?) : SessionStore {
    private val tokens = MutableStateFlow(initial)
    private val role = MutableStateFlow<RoleRef?>(null)
    private val child = MutableStateFlow<String?>(null)
    private val mustChange = MutableStateFlow(false)
    var clearCount = 0

    override val hasTokens: Flow<Boolean> = tokens.map { it != null }
    override val activeRole: Flow<RoleRef?> = role
    override val activeChildId: Flow<String?> = child
    override val mustChangePassword: Flow<Boolean> = mustChange

    override suspend fun tokens(): AuthTokens? = tokens.value
    override suspend fun saveTokens(tokens: AuthTokens) {
        this.tokens.value = tokens
    }
    override suspend fun setActiveRole(role: RoleRef?) {
        this.role.value = role
    }
    override suspend fun setActiveChild(childId: String?) {
        child.value = childId
    }
    override suspend fun setMustChangePassword(required: Boolean) {
        mustChange.value = required
    }
    override suspend fun clear() {
        clearCount++
        tokens.value = null
    }
}
