package com.schoolapp.core.network.homework

import dagger.Module
import dagger.Provides
import dagger.hilt.InstallIn
import dagger.hilt.components.SingletonComponent
import retrofit2.Retrofit
import javax.inject.Singleton

@Module
@InstallIn(SingletonComponent::class)
object HomeworkNetworkModule {
    @Provides
    @Singleton
    fun provideHomeworkApi(retrofit: Retrofit): HomeworkApi = retrofit.create(HomeworkApi::class.java)
}
