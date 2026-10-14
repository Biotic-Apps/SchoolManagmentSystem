package com.schoolapp.core.network.students.list

import dagger.Module
import dagger.Provides
import dagger.hilt.InstallIn
import dagger.hilt.components.SingletonComponent
import retrofit2.Retrofit
import javax.inject.Singleton

@Module
@InstallIn(SingletonComponent::class)
object StudentListNetworkModule {
    @Provides
    @Singleton
    fun provideStudentListApi(retrofit: Retrofit): StudentListApi = retrofit.create(StudentListApi::class.java)
}
