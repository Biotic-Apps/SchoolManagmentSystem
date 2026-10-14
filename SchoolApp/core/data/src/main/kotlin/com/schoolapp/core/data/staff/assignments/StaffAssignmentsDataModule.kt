package com.schoolapp.core.data.staff.assignments

import dagger.Binds
import dagger.Module
import dagger.hilt.InstallIn
import dagger.hilt.components.SingletonComponent

@Module
@InstallIn(SingletonComponent::class)
internal abstract class StaffAssignmentsDataModule {
    @Binds
    abstract fun bindStaffAssignmentsRepository(impl: DefaultStaffAssignmentsRepository): StaffAssignmentsRepository
}
