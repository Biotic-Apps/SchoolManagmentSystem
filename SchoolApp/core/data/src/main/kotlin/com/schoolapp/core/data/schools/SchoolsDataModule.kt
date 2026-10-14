package com.schoolapp.core.data.schools

import dagger.Binds
import dagger.Module
import dagger.hilt.InstallIn
import dagger.hilt.components.SingletonComponent

/** Bound here (not in :app RepositoryModule) so the schools area stays self-contained. */
@Module
@InstallIn(SingletonComponent::class)
internal abstract class SchoolsDataModule {
    @Binds
    abstract fun bindSchoolsRepository(impl: DefaultSchoolsRepository): SchoolsRepository
}
