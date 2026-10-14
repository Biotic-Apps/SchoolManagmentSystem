package com.schoolapp.core.data.settings

import dagger.Binds
import dagger.Module
import dagger.hilt.InstallIn
import dagger.hilt.components.SingletonComponent

/** Settings & Backups repositories, bound here so the shared RepositoryModule stays untouched. */
@Module
@InstallIn(SingletonComponent::class)
internal abstract class SettingsDataModule {
    @Binds
    abstract fun bindSettingsRepository(impl: DefaultSettingsRepository): SettingsRepository

    @Binds
    abstract fun bindSupportRepository(impl: DefaultSupportRepository): SupportRepository

    @Binds
    abstract fun bindBackupsRepository(impl: DefaultBackupsRepository): BackupsRepository

    @Binds
    abstract fun bindImportsRepository(impl: DefaultImportsRepository): ImportsRepository
}
