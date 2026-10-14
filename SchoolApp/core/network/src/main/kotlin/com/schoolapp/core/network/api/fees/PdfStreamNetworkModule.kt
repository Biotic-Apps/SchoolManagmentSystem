package com.schoolapp.core.network.api.fees

import dagger.Module
import dagger.Provides
import dagger.hilt.InstallIn
import dagger.hilt.components.SingletonComponent
import retrofit2.Retrofit
import javax.inject.Singleton

@Module
@InstallIn(SingletonComponent::class)
object PdfStreamNetworkModule {
    @Provides
    @Singleton
    fun providePdfStreamApi(retrofit: Retrofit): PdfStreamApi = retrofit.create(PdfStreamApi::class.java)
}
