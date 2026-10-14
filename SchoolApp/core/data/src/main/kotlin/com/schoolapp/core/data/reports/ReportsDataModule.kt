package com.schoolapp.core.data.reports

import dagger.Binds
import dagger.Module
import dagger.hilt.InstallIn
import dagger.hilt.components.SingletonComponent

@Module
@InstallIn(SingletonComponent::class)
interface ReportsDataModule {
    @Binds
    fun bindReportsRepository(impl: DefaultReportsRepository): ReportsRepository
}
