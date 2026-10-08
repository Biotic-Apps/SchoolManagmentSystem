package com.schoolapp.feature.students

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

internal class FakeOrganisationRepository(
    private val sections: List<Section> = listOf(Section("s1", "c5", "Class 5", "A", 30, null, 20, "ACTIVE")),
) : OrganisationRepository {
    override suspend fun branches(): AppResult<List<Branch>> = AppResult.Success(emptyList())
    override suspend fun branchOverview(branchId: String): AppResult<BranchOverview> = AppResult.Failure(AppError.Network)
    override suspend fun sessions(branchId: String): AppResult<List<AcademicSession>> = AppResult.Success(emptyList())
    override suspend fun calendar(branchId: String, from: String?, to: String?): AppResult<List<CalendarEvent>> =
        AppResult.Success(emptyList())
    override suspend fun classes(schoolId: String?): AppResult<List<SchoolClass>> = AppResult.Success(emptyList())
    override suspend fun sections(branchId: String, sessionId: String?): AppResult<List<Section>> = AppResult.Success(sections)
    override suspend fun subjects(schoolId: String?): AppResult<List<Subject>> = AppResult.Success(emptyList())
}
