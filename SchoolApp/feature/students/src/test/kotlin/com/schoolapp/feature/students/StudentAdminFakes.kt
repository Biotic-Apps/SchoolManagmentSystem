package com.schoolapp.feature.students

import com.schoolapp.core.common.result.AppError
import com.schoolapp.core.common.result.AppResult
import com.schoolapp.core.data.organisation.OrganisationRepository
import com.schoolapp.core.data.people.StudentAdminRepository
import com.schoolapp.core.model.organisation.AcademicSession
import com.schoolapp.core.model.organisation.Branch
import com.schoolapp.core.model.organisation.BranchOverview
import com.schoolapp.core.model.organisation.CalendarEvent
import com.schoolapp.core.model.organisation.SchoolClass
import com.schoolapp.core.model.organisation.Section
import com.schoolapp.core.model.organisation.Subject
import com.schoolapp.core.model.people.ApplicationInput
import com.schoolapp.core.model.people.EnrollmentChange
import com.schoolapp.core.model.people.GuardianInput
import com.schoolapp.core.model.people.LinkGuardianInput
import com.schoolapp.core.model.people.RegisterStudentInput
import com.schoolapp.core.model.people.RegisteredStudent
import com.schoolapp.core.model.people.StudentUpdate

internal class FakeStudentAdmin : StudentAdminRepository {
    var failWith: AppError? = null
    val registered = mutableListOf<RegisterStudentInput>()
    val updates = mutableListOf<StudentUpdate>()
    val changes = mutableListOf<EnrollmentChange>()
    val links = mutableListOf<LinkGuardianInput>()
    val guardianEdits = mutableListOf<Pair<String, GuardianInput>>()

    private fun <T> answer(value: () -> T): AppResult<T> = failWith?.let { AppResult.Failure(it) } ?: AppResult.Success(value())

    override suspend fun register(input: RegisterStudentInput) = answer {
        registered += input
        RegisteredStudent("st-new", "${input.child.firstName} ${input.child.lastName}", "ADM-9")
    }
    override suspend fun update(studentId: String, update: StudentUpdate) = answer { updates += update }
    override suspend fun changeEnrollment(studentId: String, change: EnrollmentChange) = answer { changes += change }
    override suspend fun linkGuardian(studentId: String, input: LinkGuardianInput) = answer { links += input }
    override suspend fun updateGuardian(guardianId: String, input: GuardianInput) = answer { guardianEdits += guardianId to input }
    override suspend fun createApplication(input: ApplicationInput) = answer { "app-1" }
}

internal class FakeOrganisation : OrganisationRepository {
    var sections = listOf(
        Section("s1", "c5", "Class 5", "A", 35, null, 30, "ACTIVE"),
        Section("s2", "c5", "Class 5", "B", 30, null, 30, "ACTIVE"),
    )
    override suspend fun branches(): AppResult<List<Branch>> = AppResult.Success(
        listOf(branch("b1", "Main Branch"), branch("b2", "City Branch")),
    )
    override suspend fun branchOverview(branchId: String): AppResult<BranchOverview> = error("unused")
    override suspend fun sessions(branchId: String): AppResult<List<AcademicSession>> =
        AppResult.Success(listOf(AcademicSession("se1", branchId, "2026-27", "2026-04-01", "2027-03-31", "ACTIVE", 3)))
    override suspend fun calendar(branchId: String, from: String?, to: String?): AppResult<List<CalendarEvent>> = AppResult.Success(emptyList())
    override suspend fun classes(schoolId: String?): AppResult<List<SchoolClass>> = AppResult.Success(emptyList())
    override suspend fun sections(branchId: String, sessionId: String?): AppResult<List<Section>> = AppResult.Success(sections)
    override suspend fun subjects(schoolId: String?): AppResult<List<Subject>> = AppResult.Success(emptyList())

    private fun branch(id: String, name: String) = Branch(id, "s1", "City School", null, name, null, null, null, null, emptyList(), null, "ACTIVE")
}
