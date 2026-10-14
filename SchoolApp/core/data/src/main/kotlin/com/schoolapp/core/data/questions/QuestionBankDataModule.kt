package com.schoolapp.core.data.questions

import dagger.Binds
import dagger.Module
import dagger.hilt.InstallIn
import dagger.hilt.components.SingletonComponent

@Module
@InstallIn(SingletonComponent::class)
interface QuestionBankDataModule {
    @Binds
    fun bindQuestionBankRepository(impl: DefaultQuestionBankRepository): QuestionBankRepository
}
