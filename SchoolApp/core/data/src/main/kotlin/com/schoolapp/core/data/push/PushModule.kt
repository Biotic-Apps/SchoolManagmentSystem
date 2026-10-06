package com.schoolapp.core.data.push

import dagger.Module
import dagger.Provides
import dagger.hilt.InstallIn
import dagger.hilt.components.SingletonComponent

/**
 * Binds [NoOpPushTokenProvider]: this build has no push. A Firebase build drops this module and binds a
 * provider backed by `FirebaseMessaging.getInstance().token` instead (see [PushTokenProvider]).
 */
@Module
@InstallIn(SingletonComponent::class)
object PushModule {
    @Provides
    fun providePushTokenProvider(): PushTokenProvider = NoOpPushTokenProvider
}
