package com.schoolapp.core.data.students.detail

import com.schoolapp.core.data.documents.DefaultStudentDocumentsRepository
import com.schoolapp.core.data.documents.StudentDocumentsRepository
import com.schoolapp.core.data.idcards.DefaultStudentIdCardRepository
import com.schoolapp.core.data.idcards.StudentIdCardRepository
import dagger.Binds
import dagger.Module
import dagger.hilt.InstallIn
import dagger.hilt.components.SingletonComponent

@Module
@InstallIn(SingletonComponent::class)
internal interface StudentDetailDataModule {
    @Binds
    fun bindStudentDetailExtrasRepository(impl: DefaultStudentDetailExtrasRepository): StudentDetailExtrasRepository

    @Binds
    fun bindStudentIdCardRepository(impl: DefaultStudentIdCardRepository): StudentIdCardRepository

    @Binds
    fun bindStudentDocumentsRepository(impl: DefaultStudentDocumentsRepository): StudentDocumentsRepository
}
