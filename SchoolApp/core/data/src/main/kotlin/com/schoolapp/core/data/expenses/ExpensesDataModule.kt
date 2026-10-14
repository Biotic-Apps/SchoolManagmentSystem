package com.schoolapp.core.data.expenses

import dagger.Binds
import dagger.Module
import dagger.hilt.InstallIn
import dagger.hilt.components.SingletonComponent

@Module
@InstallIn(SingletonComponent::class)
interface ExpensesDataModule {
    @Binds
    fun bindExpensesRepository(impl: DefaultExpensesRepository): ExpensesRepository
}
