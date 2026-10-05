package com.schoolapp.core.datastore

import androidx.datastore.preferences.core.booleanPreferencesKey
import androidx.datastore.preferences.core.stringPreferencesKey

internal object SessionKeys {
    val AccessToken = stringPreferencesKey("access_token")
    val RefreshToken = stringPreferencesKey("refresh_token")
    val ActiveRole = stringPreferencesKey("active_role")
    val ActiveChild = stringPreferencesKey("active_child")
    val MustChangePassword = booleanPreferencesKey("must_change_password")
}
