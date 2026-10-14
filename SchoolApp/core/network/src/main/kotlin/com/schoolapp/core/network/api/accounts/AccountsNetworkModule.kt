package com.schoolapp.core.network.api.accounts

import dagger.Module
import dagger.Provides
import dagger.hilt.InstallIn
import dagger.hilt.components.SingletonComponent
import retrofit2.Retrofit
import javax.inject.Singleton

@Module
@InstallIn(SingletonComponent::class)
object AccountsNetworkModule {
    @Provides
    @Singleton
    fun provideAccountsApi(retrofit: Retrofit): AccountsApi = retrofit.create(AccountsApi::class.java)
}
