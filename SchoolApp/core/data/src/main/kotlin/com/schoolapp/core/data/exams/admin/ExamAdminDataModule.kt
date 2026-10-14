package com.schoolapp.core.data.exams.admin

import dagger.Binds
import dagger.Module
import dagger.hilt.InstallIn
import dagger.hilt.components.SingletonComponent

@Module
@InstallIn(SingletonComponent::class)
interface ExamAdminDataModule {
    @Binds
    fun bindExamAdminRepository(impl: DefaultExamAdminRepository): ExamAdminRepository
}
