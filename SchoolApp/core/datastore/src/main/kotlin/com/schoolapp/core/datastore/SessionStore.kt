package com.schoolapp.core.datastore

import com.schoolapp.core.model.AuthTokens
import com.schoolapp.core.model.RoleRef
import kotlinx.coroutines.flow.Flow

/** Encrypted local session: auth tokens, active role, active child and the forced password-change flag. */
interface SessionStore {
    val hasTokens: Flow<Boolean>
    val activeRole: Flow<RoleRef?>
    val activeChildId: Flow<String?>
    val mustChangePassword: Flow<Boolean>

    suspend fun tokens(): AuthTokens?
    suspend fun saveTokens(tokens: AuthTokens)
    suspend fun setActiveRole(role: RoleRef?)
    suspend fun setActiveChild(childId: String?)
    suspend fun setMustChangePassword(required: Boolean)
    suspend fun clear()
}
