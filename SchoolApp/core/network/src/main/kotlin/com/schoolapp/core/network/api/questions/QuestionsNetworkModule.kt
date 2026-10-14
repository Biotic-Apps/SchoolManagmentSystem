package com.schoolapp.core.network.api.questions

import dagger.Module
import dagger.Provides
import dagger.hilt.InstallIn
import dagger.hilt.components.SingletonComponent
import retrofit2.Retrofit
import javax.inject.Singleton

@Module
@InstallIn(SingletonComponent::class)
object QuestionsNetworkModule {
    @Provides
    @Singleton
    fun provideQuestionsApi(retrofit: Retrofit): QuestionsApi = retrofit.create(QuestionsApi::class.java)
}
