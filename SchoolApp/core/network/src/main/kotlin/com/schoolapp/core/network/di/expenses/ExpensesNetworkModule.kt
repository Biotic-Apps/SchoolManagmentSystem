package com.schoolapp.core.network.di.expenses

import com.schoolapp.core.network.api.expenses.ExpensesApi
import dagger.Module
import dagger.Provides
import dagger.hilt.InstallIn
import dagger.hilt.components.SingletonComponent
import retrofit2.Retrofit
import javax.inject.Singleton

@Module
@InstallIn(SingletonComponent::class)
object ExpensesNetworkModule {
    @Provides
    @Singleton
    fun provideExpensesApi(retrofit: Retrofit): ExpensesApi = retrofit.create(ExpensesApi::class.java)
}
