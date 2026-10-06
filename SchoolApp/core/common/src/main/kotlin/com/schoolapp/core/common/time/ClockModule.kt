package com.schoolapp.core.common.time

import dagger.Module
import dagger.Provides
import dagger.hilt.InstallIn
import dagger.hilt.components.SingletonComponent
import java.time.LocalDateTime

@Module
@InstallIn(SingletonComponent::class)
internal object ClockModule {
    @Provides
    fun provideClock(): AppClock = AppClock { LocalDateTime.now() }
}
