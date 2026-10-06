package com.schoolapp.demo

import com.schoolapp.core.common.result.AppError
import com.schoolapp.core.common.result.AppResult
import com.schoolapp.core.data.people.DefaultStudentsRepository
import com.schoolapp.core.data.people.StudentsRepository
import com.schoolapp.core.model.RoleKey
import com.schoolapp.core.model.people.StudentDetail
import com.schoolapp.core.model.people.StudentSummary
import javax.inject.Inject
import javax.inject.Singleton

@Singleton
class DemoAwareStudentsRepository @Inject constructor(
    private val real: DefaultStudentsRepository,
    private val auth: DemoAwareAuthRepository,
) : StudentsRepository {

    override suspend fun students(sectionId: String?, search: String?): AppResult<List<StudentSummary>> {
        if (!auth.isDemoActive) return real.students(sectionId, search)
        val query = search?.trim().orEmpty()
        return AppResult.Success(
            visible().filter { sectionId == null || it.sectionId == sectionId }
                .filter { query.isEmpty() || it.name.contains(query, true) || it.admissionNo.orEmpty().contains(query, true) },
        )
    }

    override suspend fun student(id: String): AppResult<StudentDetail> {
        if (!auth.isDemoActive) return real.student(id)
        val detail = DemoPeopleData.detail(id)?.takeIf { d -> visible().any { it.id == d.summary.id } }
        return detail?.let { AppResult.Success(it) } ?: AppResult.Failure(AppError.Server(NOT_FOUND, "NOT_FOUND", null))
    }

    /** Mirrors server scope: parents see linked children, teachers their sections (5-A, 5-B). */
    private fun visible(): List<StudentSummary> = when (auth.demoSession.value?.activeRole) {
        RoleKey.PARENT -> DemoPeopleData.students.filter { it.id == DemoPeopleData.CHILD_1 || it.id == DemoPeopleData.CHILD_2 }
        RoleKey.TEACHER, RoleKey.HELPER -> DemoPeopleData.students.filter { it.sectionId in TEACHER_SECTIONS }
        else -> DemoPeopleData.students
    }

    internal companion object {
        const val NOT_FOUND = 404
        val TEACHER_SECTIONS = setOf("demo-sec-5a", "demo-sec-5b")
    }
}
