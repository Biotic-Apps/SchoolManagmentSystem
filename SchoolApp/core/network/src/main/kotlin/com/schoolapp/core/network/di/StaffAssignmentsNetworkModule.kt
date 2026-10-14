package com.schoolapp.core.network.di

import com.schoolapp.core.network.api.staff.StaffAssignmentsApi
import dagger.Module
import dagger.Provides
import dagger.hilt.InstallIn
import dagger.hilt.components.SingletonComponent
import retrofit2.Retrofit
import javax.inject.Singleton

@Module
@InstallIn(SingletonComponent::class)
object StaffAssignmentsNetworkModule {
    @Provides
    @Singleton
    fun provideStaffAssignmentsApi(retrofit: Retrofit): StaffAssignmentsApi = retrofit.create(StaffAssignmentsApi::class.java)
}
