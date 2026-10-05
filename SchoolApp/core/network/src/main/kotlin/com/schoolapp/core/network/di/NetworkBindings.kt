package com.schoolapp.core.network.di

import com.schoolapp.core.network.auth.RetrofitTokenRefresher
import com.schoolapp.core.network.auth.TokenRefresher
import com.schoolapp.core.network.pending.OkHttpPendingRequestSender
import com.schoolapp.core.network.pending.PendingRequestSender
import dagger.Binds
import dagger.Module
import dagger.hilt.InstallIn
import dagger.hilt.components.SingletonComponent

@Module
@InstallIn(SingletonComponent::class)
internal abstract class NetworkBindings {
    @Binds
    abstract fun bindTokenRefresher(impl: RetrofitTokenRefresher): TokenRefresher

    @Binds
    abstract fun bindPendingRequestSender(impl: OkHttpPendingRequestSender): PendingRequestSender
}
