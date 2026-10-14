package com.schoolapp.core.network.schools

import dagger.Module
import dagger.Provides
import dagger.hilt.InstallIn
import dagger.hilt.components.SingletonComponent
import retrofit2.Retrofit
import javax.inject.Singleton

@Module
@InstallIn(SingletonComponent::class)
object SchoolsNetworkModule {
    @Provides
    @Singleton
    fun provideSchoolsApi(retrofit: Retrofit): SchoolsApi = retrofit.create(SchoolsApi::class.java)
}
