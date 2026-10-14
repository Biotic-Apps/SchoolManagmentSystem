package com.schoolapp.core.network.api.students.detail

import com.schoolapp.core.network.api.idcards.StudentIdCardApi
import dagger.Module
import dagger.Provides
import dagger.hilt.InstallIn
import dagger.hilt.components.SingletonComponent
import retrofit2.Retrofit
import javax.inject.Singleton

@Module
@InstallIn(SingletonComponent::class)
object StudentDetailNetworkModule {
    @Provides
    @Singleton
    fun provideStudentDetailExtrasApi(retrofit: Retrofit): StudentDetailExtrasApi = retrofit.create(StudentDetailExtrasApi::class.java)

    @Provides
    @Singleton
    fun provideStudentIdCardApi(retrofit: Retrofit): StudentIdCardApi = retrofit.create(StudentIdCardApi::class.java)
}
