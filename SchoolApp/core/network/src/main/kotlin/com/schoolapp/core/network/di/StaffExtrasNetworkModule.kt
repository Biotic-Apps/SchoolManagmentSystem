package com.schoolapp.core.network.di

import com.schoolapp.core.network.api.staff.HrLettersApi
import com.schoolapp.core.network.api.staff.StaffIdCardApi
import dagger.Module
import dagger.Provides
import dagger.hilt.InstallIn
import dagger.hilt.components.SingletonComponent
import retrofit2.Retrofit
import javax.inject.Singleton

/** Staff profile extras: ID card and HR letters. */
@Module
@InstallIn(SingletonComponent::class)
object StaffExtrasNetworkModule {
    @Provides
    @Singleton
    fun provideStaffIdCardApi(retrofit: Retrofit): StaffIdCardApi = retrofit.create(StaffIdCardApi::class.java)

    @Provides
    @Singleton
    fun provideHrLettersApi(retrofit: Retrofit): HrLettersApi = retrofit.create(HrLettersApi::class.java)
}
