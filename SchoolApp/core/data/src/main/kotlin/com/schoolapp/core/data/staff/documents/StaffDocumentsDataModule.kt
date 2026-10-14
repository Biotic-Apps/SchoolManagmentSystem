package com.schoolapp.core.data.staff.documents

import dagger.Binds
import dagger.Module
import dagger.hilt.InstallIn
import dagger.hilt.components.SingletonComponent

@Module
@InstallIn(SingletonComponent::class)
internal abstract class StaffDocumentsDataModule {
    @Binds
    abstract fun bindStaffDocumentsRepository(impl: DefaultStaffDocumentsRepository): StaffDocumentsRepository
}
