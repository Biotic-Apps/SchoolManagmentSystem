package com.schoolapp.core.network.guardians

import dagger.Module
import dagger.Provides
import dagger.hilt.InstallIn
import dagger.hilt.components.SingletonComponent
import retrofit2.Retrofit
import javax.inject.Singleton

@Module
@InstallIn(SingletonComponent::class)
object GuardianAdminNetworkModule {
    @Provides
    @Singleton
    fun provideGuardianAdminApi(retrofit: Retrofit): GuardianAdminApi = retrofit.create(GuardianAdminApi::class.java)
}
