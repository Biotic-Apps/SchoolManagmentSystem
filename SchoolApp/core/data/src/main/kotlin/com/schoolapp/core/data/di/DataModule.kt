package com.schoolapp.core.data.di

import android.os.Build
import android.os.SystemClock
import com.schoolapp.core.data.applock.BiometricDeviceLockChecker
import com.schoolapp.core.data.applock.DeviceLockChecker
import com.schoolapp.core.data.applock.MonotonicClock
import com.schoolapp.core.data.auth.LocalSessionTerminator
import com.schoolapp.core.network.auth.SessionInvalidator
import dagger.Binds
import dagger.Module
import dagger.Provides
import dagger.hilt.InstallIn
import dagger.hilt.components.SingletonComponent

/** Repository interfaces are bound in :app (RepositoryModule, same for every build type). */
@Module
@InstallIn(SingletonComponent::class)
internal abstract class DataModule {

    @Binds
    abstract fun bindSessionInvalidator(impl: LocalSessionTerminator): SessionInvalidator

    @Binds
    abstract fun bindDeviceLockChecker(impl: BiometricDeviceLockChecker): DeviceLockChecker

    companion object {
        @Provides
        @DeviceName
        fun provideDeviceName(): String = Build.MODEL?.takeIf { it.isNotBlank() } ?: "Android"

        @Provides
        fun provideMonotonicClock(): MonotonicClock = MonotonicClock(SystemClock::elapsedRealtime)
    }
}
