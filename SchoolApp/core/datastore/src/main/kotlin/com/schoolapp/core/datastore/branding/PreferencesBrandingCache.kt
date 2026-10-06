package com.schoolapp.core.datastore.branding

import androidx.datastore.core.DataStore
import androidx.datastore.preferences.core.MutablePreferences
import androidx.datastore.preferences.core.Preferences
import androidx.datastore.preferences.core.edit
import androidx.datastore.preferences.core.emptyPreferences
import com.schoolapp.core.common.dispatcher.IoDispatcher
import com.schoolapp.core.model.branding.Branding
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

/** The DataStore is created lazily on the IO dispatcher, on first read or write. */
@Singleton
internal class PreferencesBrandingCache @Inject constructor(
    @BrandingDataStore private val dataStore: dagger.Lazy<DataStore<Preferences>>,
    @IoDispatcher private val io: CoroutineDispatcher,
) : BrandingCache {

    override val branding: Flow<Branding?> = flow { emitAll(dataStore.get().data) }
        .catch { e -> if (e is IOException) emit(emptyPreferences()) else throw e }
        .map { it.toBranding() }
        .distinctUntilChanged()
        .flowOn(io)

    override suspend fun save(branding: Branding) = withContext(io) {
        dataStore.get().edit { prefs ->
            prefs[BrandingKeys.Saved] = true
            prefs.put(BrandingKeys.SchoolName, branding.schoolName)
            prefs.put(BrandingKeys.AppName, branding.appName)
            prefs.put(BrandingKeys.LogoUrl, branding.logoUrl)
            prefs.put(BrandingKeys.PrimaryColor, branding.primaryColor)
            prefs.put(BrandingKeys.AccentSoftColor, branding.accentSoftColor)
        }
        Unit
    }

    private fun MutablePreferences.put(key: Preferences.Key<String>, value: String?) {
        if (value == null) remove(key) else this[key] = value
    }

    private fun Preferences.toBranding(): Branding? {
        if (this[BrandingKeys.Saved] != true) return null
        return Branding(
            schoolName = this[BrandingKeys.SchoolName],
            appName = this[BrandingKeys.AppName],
            logoUrl = this[BrandingKeys.LogoUrl],
            primaryColor = this[BrandingKeys.PrimaryColor],
            accentSoftColor = this[BrandingKeys.AccentSoftColor],
        )
    }
}
