package com.schoolapp.core.network.transfers

import dagger.Module
import dagger.Provides
import dagger.hilt.InstallIn
import dagger.hilt.components.SingletonComponent
import retrofit2.Retrofit
import javax.inject.Singleton

@Module
@InstallIn(SingletonComponent::class)
object TransfersNetworkModule {
    @Provides
    @Singleton
    fun provideTransfersApi(retrofit: Retrofit): TransfersApi = retrofit.create(TransfersApi::class.java)
}
