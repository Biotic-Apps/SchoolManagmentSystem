package com.schoolapp.demo

import com.schoolapp.core.common.result.AppResult
import com.schoolapp.core.data.organisation.DefaultOrganisationRepository
import com.schoolapp.core.data.organisation.OrganisationRepository
import com.schoolapp.core.model.organisation.AcademicSession
import com.schoolapp.core.model.organisation.Branch
import com.schoolapp.core.model.organisation.BranchOverview
import com.schoolapp.core.model.organisation.CalendarEvent
import com.schoolapp.core.model.organisation.SchoolClass
import com.schoolapp.core.model.organisation.Section
import com.schoolapp.core.model.organisation.Subject
import com.schoolapp.core.model.RoleKey
import javax.inject.Inject
import javax.inject.Singleton

@Singleton
class DemoAwareOrganisationRepository @Inject constructor(
    private val real: DefaultOrganisationRepository,
    private val auth: DemoAwareAuthRepository,
) : OrganisationRepository {

    private val demo: Boolean get() = auth.isDemoActive

    override suspend fun branches(): AppResult<List<Branch>> {
        if (!demo) return real.branches()
        val global = auth.demoSession.value?.activeRole == RoleKey.SUPER_ADMIN
        return AppResult.Success(if (global) DemoData.branches else DemoData.branches.take(1))
    }

    override suspend fun branchOverview(branchId: String): AppResult<BranchOverview> =
        if (demo) AppResult.Success(DemoData.overview(branchId)) else real.branchOverview(branchId)

    override suspend fun sessions(branchId: String): AppResult<List<AcademicSession>> =
        if (demo) AppResult.Success(DemoData.sessions) else real.sessions(branchId)

    override suspend fun calendar(branchId: String, from: String?, to: String?): AppResult<List<CalendarEvent>> =
        if (demo) AppResult.Success(DemoData.events) else real.calendar(branchId, from, to)

    override suspend fun classes(schoolId: String?): AppResult<List<SchoolClass>> =
        if (demo) AppResult.Success(DemoData.classes) else real.classes(schoolId)

    override suspend fun sections(branchId: String, sessionId: String?): AppResult<List<Section>> =
        if (demo) AppResult.Success(DemoData.sections) else real.sections(branchId, sessionId)

    override suspend fun subjects(schoolId: String?): AppResult<List<Subject>> =
        if (demo) AppResult.Success(DemoData.subjects) else real.subjects(schoolId)
}
