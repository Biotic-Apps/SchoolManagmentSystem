package com.schoolapp.feature.dashboard.scope

import com.schoolapp.core.common.result.AppResult
import com.schoolapp.core.data.organisation.OrganisationRepository
import com.schoolapp.core.data.schools.SchoolsRepository
import com.schoolapp.core.designsystem.component.SwitcherOption
import com.schoolapp.core.model.SessionContext
import javax.inject.Inject

/** Options for each scope level, gated by the same permissions as the web picker; a failed level is simply left empty. */
class ScopeOptionsLoader @Inject constructor(
    private val schoolsRepository: SchoolsRepository,
    private val organisationRepository: OrganisationRepository,
) {
    suspend fun schools(session: SessionContext): List<SwitcherOption> {
        if (!session.has("schools.view")) return emptyList()
        val result = schoolsRepository.schools(search = null, status = null, page = 1, pageSize = MAX_ROWS)
        return (result as? AppResult.Success)?.data?.items.orEmpty()
            .sortedBy { it.name.lowercase() }
            .map { SwitcherOption(it.id, it.name) }
    }

    suspend fun branches(session: SessionContext, schoolId: String?): List<SwitcherOption> {
        if (!session.has("branches.view")) return emptyList()
        val result = organisationRepository.branches()
        return (result as? AppResult.Success)?.data.orEmpty()
            .filter { schoolId == null || it.schoolId == schoolId }
            .sortedBy { it.name.lowercase() }
            .map { SwitcherOption(it.id, it.name, it.schoolName) }
    }

    suspend fun sessions(session: SessionContext, branchId: String?): List<SwitcherOption> {
        if (branchId == null || !session.has("sessions.view")) return emptyList()
        val result = organisationRepository.sessions(branchId)
        return (result as? AppResult.Success)?.data.orEmpty().map { SwitcherOption(it.id, it.name) }
    }

    private companion object {
        const val MAX_ROWS = 100
    }
}
