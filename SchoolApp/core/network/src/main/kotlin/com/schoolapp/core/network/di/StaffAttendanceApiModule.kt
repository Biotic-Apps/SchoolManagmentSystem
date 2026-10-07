package com.schoolapp.core.network.di

import com.schoolapp.core.network.api.StaffAttendanceApi
import dagger.Module
import dagger.Provides
import dagger.hilt.InstallIn
import dagger.hilt.components.SingletonComponent
import retrofit2.Retrofit
import javax.inject.Singleton

@Module
@InstallIn(SingletonComponent::class)
internal object StaffAttendanceApiModule {
    @Provides
    @Singleton
    fun provideStaffAttendanceApi(retrofit: Retrofit): StaffAttendanceApi = retrofit.create(StaffAttendanceApi::class.java)
}
