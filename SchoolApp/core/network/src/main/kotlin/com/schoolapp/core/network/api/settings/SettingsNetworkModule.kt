package com.schoolapp.core.network.api.settings

import dagger.Module
import dagger.Provides
import dagger.hilt.InstallIn
import dagger.hilt.components.SingletonComponent
import retrofit2.Retrofit
import javax.inject.Singleton

/** Settings & Backups APIs, kept out of the shared NetworkModule. */
@Module
@InstallIn(SingletonComponent::class)
object SettingsNetworkModule {
    @Provides
    @Singleton
    fun provideSettingsApi(retrofit: Retrofit): SettingsApi = retrofit.create(SettingsApi::class.java)

    @Provides
    @Singleton
    fun provideSupportApi(retrofit: Retrofit): SupportApi = retrofit.create(SupportApi::class.java)

    @Provides
    @Singleton
    fun provideBackupsApi(retrofit: Retrofit): BackupsApi = retrofit.create(BackupsApi::class.java)

    @Provides
    @Singleton
    fun provideImportsApi(retrofit: Retrofit): ImportsApi = retrofit.create(ImportsApi::class.java)
}
