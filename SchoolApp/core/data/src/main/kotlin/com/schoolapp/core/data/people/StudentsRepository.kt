package com.schoolapp.core.data.people

import com.schoolapp.core.common.result.AppResult
import com.schoolapp.core.model.people.StudentDetail
import com.schoolapp.core.model.people.StudentSummary

/** Students visible to the active role; the server applies scope (parents: verified children only). */
interface StudentsRepository {
    suspend fun students(sectionId: String? = null, search: String? = null): AppResult<List<StudentSummary>>
    suspend fun student(id: String): AppResult<StudentDetail>
}
