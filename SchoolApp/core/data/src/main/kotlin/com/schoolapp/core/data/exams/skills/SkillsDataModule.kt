package com.schoolapp.core.data.exams.skills

import dagger.Binds
import dagger.Module
import dagger.hilt.InstallIn
import dagger.hilt.components.SingletonComponent

@Module
@InstallIn(SingletonComponent::class)
interface SkillsDataModule {
    @Binds
    fun bindSkillsRepository(impl: DefaultSkillsRepository): SkillsRepository
}
