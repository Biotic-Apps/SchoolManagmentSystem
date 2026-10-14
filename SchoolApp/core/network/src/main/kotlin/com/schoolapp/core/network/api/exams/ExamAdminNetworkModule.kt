package com.schoolapp.core.network.api.exams

import dagger.Module
import dagger.Provides
import dagger.hilt.InstallIn
import dagger.hilt.components.SingletonComponent
import retrofit2.Retrofit
import javax.inject.Singleton

@Module
@InstallIn(SingletonComponent::class)
object ExamAdminNetworkModule {
    @Provides
    @Singleton
    fun provideExamAdminApi(retrofit: Retrofit): ExamAdminApi = retrofit.create(ExamAdminApi::class.java)
}
