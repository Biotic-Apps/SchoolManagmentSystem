package com.schoolapp.core.data.roles

import dagger.Binds
import dagger.Module
import dagger.hilt.InstallIn
import dagger.hilt.components.SingletonComponent

@Module
@InstallIn(SingletonComponent::class)
interface RolesDataModule {
    @Binds
    fun bindRolesRepository(impl: DefaultRolesRepository): RolesRepository
}
