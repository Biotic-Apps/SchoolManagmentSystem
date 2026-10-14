package com.schoolapp.core.network.di

import com.schoolapp.core.network.api.profile.TwoFactorApi
import dagger.Module
import dagger.Provides
import dagger.hilt.InstallIn
import dagger.hilt.components.SingletonComponent
import retrofit2.Retrofit
import javax.inject.Singleton

@Module
@InstallIn(SingletonComponent::class)
object TwoFactorNetworkModule {
    @Provides
    @Singleton
    fun provideTwoFactorApi(retrofit: Retrofit): TwoFactorApi = retrofit.create(TwoFactorApi::class.java)
}
