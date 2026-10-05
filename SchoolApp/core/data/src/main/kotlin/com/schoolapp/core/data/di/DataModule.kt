package com.schoolapp.core.data.di

import android.os.Build
import com.schoolapp.core.data.auth.LocalSessionTerminator
import com.schoolapp.core.network.auth.SessionInvalidator
import dagger.Binds
import dagger.Module
import dagger.Provides
import dagger.hilt.InstallIn
import dagger.hilt.components.SingletonComponent

/** Repository interfaces are bound in :app (release: defaults, debug: demo-aware wrappers). */
@Module
@InstallIn(SingletonComponent::class)
internal abstract class DataModule {

    @Binds
    abstract fun bindSessionInvalidator(impl: LocalSessionTerminator): SessionInvalidator

    companion object {
        @Provides
        @DeviceName
        fun provideDeviceName(): String = Build.MODEL?.takeIf { it.isNotBlank() } ?: "Android"
    }
}
