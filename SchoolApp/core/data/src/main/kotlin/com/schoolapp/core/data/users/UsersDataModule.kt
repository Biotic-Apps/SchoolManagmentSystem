package com.schoolapp.core.data.users

import dagger.Binds
import dagger.Module
import dagger.hilt.InstallIn
import dagger.hilt.components.SingletonComponent

/** Bound here (not in :app RepositoryModule) so the users area stays self-contained. */
@Module
@InstallIn(SingletonComponent::class)
internal abstract class UsersDataModule {
    @Binds
    abstract fun bindUsersRepository(impl: DefaultUsersRepository): UsersRepository
}
