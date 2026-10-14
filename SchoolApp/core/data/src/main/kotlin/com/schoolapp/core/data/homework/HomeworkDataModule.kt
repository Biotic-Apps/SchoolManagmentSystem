package com.schoolapp.core.data.homework

import dagger.Binds
import dagger.Module
import dagger.hilt.InstallIn
import dagger.hilt.components.SingletonComponent

/** Bound here (not in :app RepositoryModule) so the homework area stays self-contained. */
@Module
@InstallIn(SingletonComponent::class)
internal abstract class HomeworkDataModule {
    @Binds
    abstract fun bindHomeworkRepository(impl: DefaultHomeworkRepository): HomeworkRepository
}
