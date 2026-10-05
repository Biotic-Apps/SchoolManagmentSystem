package com.schoolapp.core.common.dispatcher

import dagger.Binds
import dagger.Module
import dagger.Provides
import dagger.hilt.InstallIn
import dagger.hilt.components.SingletonComponent
import kotlinx.coroutines.CoroutineDispatcher
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.SupervisorJob
import javax.inject.Singleton

@Module
@InstallIn(SingletonComponent::class)
internal abstract class DispatchersModule {

    @Binds
    abstract fun bindDispatcherProvider(impl: DefaultDispatcherProvider): DispatcherProvider

    companion object {
        @Provides
        @IoDispatcher
        fun provideIoDispatcher(provider: DispatcherProvider): CoroutineDispatcher = provider.io

        @Provides
        @DefaultDispatcher
        fun provideDefaultDispatcher(provider: DispatcherProvider): CoroutineDispatcher = provider.default

        @Provides
        @Singleton
        @ApplicationScope
        fun provideApplicationScope(provider: DispatcherProvider): CoroutineScope =
            CoroutineScope(SupervisorJob() + provider.default)
    }
}
