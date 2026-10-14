package com.schoolapp.core.network.di

import com.schoolapp.core.network.api.staff.DocumentsApi
import dagger.Module
import dagger.Provides
import dagger.hilt.InstallIn
import dagger.hilt.components.SingletonComponent
import retrofit2.Retrofit
import javax.inject.Singleton

@Module
@InstallIn(SingletonComponent::class)
object DocumentsNetworkModule {
    @Provides
    @Singleton
    fun provideDocumentsApi(retrofit: Retrofit): DocumentsApi = retrofit.create(DocumentsApi::class.java)
}
