package com.schoolapp.core.network.roles

import dagger.Module
import dagger.Provides
import dagger.hilt.InstallIn
import dagger.hilt.components.SingletonComponent
import retrofit2.Retrofit
import javax.inject.Singleton

@Module
@InstallIn(SingletonComponent::class)
object RolesNetworkModule {
    @Provides
    @Singleton
    fun provideRolesApi(retrofit: Retrofit): RolesApi = retrofit.create(RolesApi::class.java)
}
