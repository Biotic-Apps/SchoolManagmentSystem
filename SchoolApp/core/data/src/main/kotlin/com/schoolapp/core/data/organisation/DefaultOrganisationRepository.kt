package com.schoolapp.core.data.organisation

import com.schoolapp.core.common.result.AppResult
import com.schoolapp.core.model.organisation.AcademicSession
import com.schoolapp.core.model.organisation.Branch
import com.schoolapp.core.model.organisation.BranchOverview
import com.schoolapp.core.model.organisation.CalendarEvent
import com.schoolapp.core.model.organisation.SchoolClass
import com.schoolapp.core.model.organisation.Section
import com.schoolapp.core.model.organisation.Subject
import com.schoolapp.core.network.ApiCaller
import com.schoolapp.core.network.api.OrganisationApi
import kotlinx.coroutines.async
import kotlinx.coroutines.coroutineScope
import javax.inject.Inject
import javax.inject.Singleton

@Singleton
class DefaultOrganisationRepository @Inject constructor(
    private val api: OrganisationApi,
    private val apiCaller: ApiCaller,
) : OrganisationRepository {

    override suspend fun branches(): AppResult<List<Branch>> =
        apiCaller.call { api.branches().data.map { it.toModel() } }

    override suspend fun branchOverview(branchId: String): AppResult<BranchOverview> = apiCaller.call {
        coroutineScope {
            val branch = async { api.branch(branchId).data.toModel() }
            val settings = async { api.branchSettings(branchId).data.toSettings() }
            BranchOverview(branch.await(), settings.await())
        }
    }

    override suspend fun sessions(branchId: String): AppResult<List<AcademicSession>> =
        apiCaller.call { api.sessions(branchId).data.map { it.toModel() } }

    override suspend fun calendar(branchId: String, from: String?, to: String?): AppResult<List<CalendarEvent>> =
        apiCaller.call { api.calendar(branchId, from, to).data.map { it.toModel() }.sortedBy { it.startDate } }

    override suspend fun classes(schoolId: String?): AppResult<List<SchoolClass>> =
        apiCaller.call { api.classes(schoolId).data.map { it.toModel() }.sortedBy { it.levelOrder ?: Int.MAX_VALUE } }

    override suspend fun sections(branchId: String, sessionId: String?): AppResult<List<Section>> =
        apiCaller.call { api.sections(branchId, sessionId).data.map { it.toModel() } }

    override suspend fun subjects(schoolId: String?): AppResult<List<Subject>> =
        apiCaller.call { api.subjects(schoolId).data.map { it.toModel() }.sortedBy { it.name } }
}
