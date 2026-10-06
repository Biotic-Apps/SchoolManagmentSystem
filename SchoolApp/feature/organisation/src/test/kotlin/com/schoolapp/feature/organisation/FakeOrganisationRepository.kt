package com.schoolapp.feature.organisation

import com.schoolapp.core.common.result.AppError
import com.schoolapp.core.common.result.AppResult
import com.schoolapp.core.data.organisation.OrganisationRepository
import com.schoolapp.core.model.organisation.AcademicSession
import com.schoolapp.core.model.organisation.Branch
import com.schoolapp.core.model.organisation.BranchOverview
import com.schoolapp.core.model.organisation.CalendarEvent
import com.schoolapp.core.model.organisation.SchoolClass
import com.schoolapp.core.model.organisation.Section
import com.schoolapp.core.model.organisation.Subject

/** Mutable answers; set [failure] to make every call fail. */
class FakeOrganisationRepository : OrganisationRepository {
    var branches = listOf(branch("b1"))
    var sessions = listOf(AcademicSession("se1", "b1", "2026-27", "2026-04-01", "2027-03-31", "ACTIVE", 3))
    var events = listOf(CalendarEvent("e1", "HOLIDAY", "Independence Day", "2026-08-14", "2026-08-14", null))
    var classes = listOf(SchoolClass("c5", "Class 5", 5, 6))
    var sections = listOf(Section("s1", "c5", "Class 5", "A", 35, null, 30, "ACTIVE"))
    var subjects = listOf(Subject("m", "MTH", "Maths"))
    var failure: AppError? = null

    override suspend fun branches(): AppResult<List<Branch>> = answer(branches)

    override suspend fun branchOverview(branchId: String): AppResult<BranchOverview> =
        answer(BranchOverview(branches.first { it.id == branchId }, emptyList()))

    override suspend fun sessions(branchId: String): AppResult<List<AcademicSession>> = answer(sessions)

    override suspend fun calendar(branchId: String, from: String?, to: String?): AppResult<List<CalendarEvent>> = answer(events)

    override suspend fun classes(schoolId: String?): AppResult<List<SchoolClass>> = answer(classes)

    override suspend fun sections(branchId: String, sessionId: String?): AppResult<List<Section>> = answer(sections)

    override suspend fun subjects(schoolId: String?): AppResult<List<Subject>> = answer(subjects)

    private fun <T> answer(value: T): AppResult<T> = failure?.let { AppResult.Failure(it) } ?: AppResult.Success(value)

    companion object {
        fun branch(id: String, name: String = "Branch $id") =
            Branch(id, "s1", "City School", null, name, null, null, null, null, emptyList(), null, "ACTIVE")
    }
}
