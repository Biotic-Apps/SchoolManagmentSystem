package com.schoolapp.core.datastore.branding

import androidx.datastore.preferences.core.booleanPreferencesKey
import androidx.datastore.preferences.core.stringPreferencesKey

internal object BrandingKeys {
    val Saved = booleanPreferencesKey("saved")
    val SchoolName = stringPreferencesKey("school_name")
    val AppName = stringPreferencesKey("app_name")
    val LogoUrl = stringPreferencesKey("logo_url")
    val PrimaryColor = stringPreferencesKey("primary_color")
    val AccentSoftColor = stringPreferencesKey("accent_soft_color")
}
