package com.schoolapp.core.data.profile.twofactor

import dagger.Binds
import dagger.Module
import dagger.hilt.InstallIn
import dagger.hilt.components.SingletonComponent

@Module
@InstallIn(SingletonComponent::class)
interface TwoFactorDataModule {
    @Binds
    fun bindTwoFactorRepository(impl: DefaultTwoFactorRepository): TwoFactorRepository
}
