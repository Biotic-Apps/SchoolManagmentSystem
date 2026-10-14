package com.schoolapp.core.data.students.list

import com.schoolapp.core.common.result.AppResult
import com.schoolapp.core.data.people.toModel
import com.schoolapp.core.model.people.StudentSummary
import com.schoolapp.core.model.settings.PagedList
import com.schoolapp.core.model.students.list.StudentListFilter
import com.schoolapp.core.network.ApiCaller
import com.schoolapp.core.network.students.list.StudentListApi
import dagger.Binds
import dagger.Module
import dagger.hilt.InstallIn
import dagger.hilt.components.SingletonComponent
import javax.inject.Inject
import javax.inject.Singleton

/** Paged Students list with the web's filters (branch session, class, section, status, search). */
interface StudentListRepository {
    suspend fun page(filter: StudentListFilter, page: Int): AppResult<PagedList<StudentSummary>>
}

@Singleton
internal class DefaultStudentListRepository @Inject constructor(
    private val api: StudentListApi,
    private val apiCaller: ApiCaller,
) : StudentListRepository {
    override suspend fun page(filter: StudentListFilter, page: Int): AppResult<PagedList<StudentSummary>> = apiCaller.call {
        api.students(
            page = page,
            branchId = filter.branchId,
            sessionId = filter.sessionId,
            classId = filter.classId,
            sectionId = filter.sectionId,
            status = filter.status,
            search = filter.search?.trim()?.takeIf { it.isNotEmpty() },
        ).toPage(page, StudentListApi.PAGE_SIZE) { it.toModel() }
    }
}

@Module
@InstallIn(SingletonComponent::class)
internal abstract class StudentListDataModule {
    @Binds
    abstract fun bind(impl: DefaultStudentListRepository): StudentListRepository
}
