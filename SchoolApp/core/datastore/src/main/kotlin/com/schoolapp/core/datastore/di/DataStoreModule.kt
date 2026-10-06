package com.schoolapp.core.datastore.di

import android.content.Context
import androidx.datastore.core.DataStore
import androidx.datastore.preferences.core.PreferenceDataStoreFactory
import androidx.datastore.preferences.core.Preferences
import androidx.datastore.preferences.preferencesDataStoreFile
import com.schoolapp.core.common.dispatcher.IoDispatcher
import com.schoolapp.core.datastore.EncryptedSessionStore
import com.schoolapp.core.datastore.SessionDataStore
import com.schoolapp.core.datastore.SessionStore
import com.schoolapp.core.datastore.branding.BrandingCache
import com.schoolapp.core.datastore.branding.BrandingDataStore
import com.schoolapp.core.datastore.branding.PreferencesBrandingCache
import com.schoolapp.core.datastore.crypto.KeystoreStringCipher
import com.schoolapp.core.datastore.crypto.StringCipher
import dagger.Binds
import dagger.Module
import dagger.Provides
import dagger.hilt.InstallIn
import dagger.hilt.android.qualifiers.ApplicationContext
import dagger.hilt.components.SingletonComponent
import kotlinx.coroutines.CoroutineDispatcher
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.SupervisorJob
import javax.inject.Singleton

@Module
@InstallIn(SingletonComponent::class)
internal abstract class DataStoreModule {

    @Binds
    abstract fun bindSessionStore(impl: EncryptedSessionStore): SessionStore

    @Binds
    abstract fun bindBrandingCache(impl: PreferencesBrandingCache): BrandingCache

    @Binds
    abstract fun bindCipher(impl: KeystoreStringCipher): StringCipher

    companion object {
        @Provides
        @Singleton
        @SessionDataStore
        fun provideSessionDataStore(
            @ApplicationContext context: Context,
            @IoDispatcher io: CoroutineDispatcher,
        ): DataStore<Preferences> = PreferenceDataStoreFactory.create(
            scope = CoroutineScope(io + SupervisorJob()),
            produceFile = { context.preferencesDataStoreFile("session") },
        )

        @Provides
        @Singleton
        @BrandingDataStore
        fun provideBrandingDataStore(
            @ApplicationContext context: Context,
            @IoDispatcher io: CoroutineDispatcher,
        ): DataStore<Preferences> = PreferenceDataStoreFactory.create(
            scope = CoroutineScope(io + SupervisorJob()),
            produceFile = { context.preferencesDataStoreFile("branding") },
        )
    }
}
