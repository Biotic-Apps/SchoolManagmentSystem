package com.schoolapp.core.data.people

import com.schoolapp.core.common.result.AppResult
import com.schoolapp.core.model.people.StudentDetail
import com.schoolapp.core.model.people.StudentSummary
import com.schoolapp.core.network.ApiCaller
import com.schoolapp.core.network.api.StudentsApi
import javax.inject.Inject
import javax.inject.Singleton

@Singleton
class DefaultStudentsRepository @Inject constructor(
    private val api: StudentsApi,
    private val apiCaller: ApiCaller,
) : StudentsRepository {

    override suspend fun students(sectionId: String?, search: String?): AppResult<List<StudentSummary>> =
        apiCaller.call {
            api.students(sectionId = sectionId, search = search?.trim()?.takeIf { it.isNotEmpty() })
                .data.map { it.toModel() }
                .sortedWith(compareBy({ it.rollNo ?: Int.MAX_VALUE }, { it.name }))
        }

    override suspend fun student(id: String): AppResult<StudentDetail> =
        apiCaller.call { api.student(id).data.toModel() }
}
