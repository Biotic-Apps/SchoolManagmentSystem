package com.schoolapp.di

import com.schoolapp.core.data.attendance.DefaultStaffAttendanceRepository
import com.schoolapp.core.data.attendance.StaffAttendanceRepository
import dagger.Binds
import dagger.Module
import dagger.hilt.InstallIn
import dagger.hilt.components.SingletonComponent

@Module
@InstallIn(SingletonComponent::class)
interface StaffAttendanceRepositoryModule {
    @Binds
    fun bindStaffAttendanceRepository(impl: DefaultStaffAttendanceRepository): StaffAttendanceRepository
}
