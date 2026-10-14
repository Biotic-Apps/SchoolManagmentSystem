package com.schoolapp.feature.questionbank.common

import com.schoolapp.core.common.result.AppResult
import com.schoolapp.core.data.organisation.OrganisationRepository
import com.schoolapp.core.model.SessionContext
import javax.inject.Inject

/** A school the user can manage questions for (questions and papers belong to a school, not a branch). */
data class SchoolOption(val id: String, val name: String)

/**
 * Schools of the active role: from the scoped `/branches` list when the role holds `branches.view`
 * (super admin, principal), otherwise from the active role assignments (teachers, coordinators).
 */
class SchoolOptionsLoader @Inject constructor(
    private val organisation: OrganisationRepository,
) {
    suspend fun load(session: SessionContext): AppResult<List<SchoolOption>> {
        val own = session.activeAssignments
            .mapNotNull { a -> a.schoolId?.let { SchoolOption(it, a.schoolName ?: a.branchName ?: it) } }
            .distinctBy { it.id }
        if (!session.has(BRANCHES_VIEW)) return AppResult.Success(own)
        return when (val result = organisation.branches()) {
            is AppResult.Success -> {
                val schools = result.data
                    .mapNotNull { b -> b.schoolId?.let { SchoolOption(it, b.schoolName ?: b.name) } }
                    .distinctBy { it.id }
                AppResult.Success(schools.ifEmpty { own })
            }
            is AppResult.Failure -> if (own.isNotEmpty()) AppResult.Success(own) else result
        }
    }

    /** The school of the active role assignment when listed, else the first one. */
    fun preferred(session: SessionContext, schools: List<SchoolOption>): String? =
        schools.firstOrNull { s -> session.activeAssignments.any { it.schoolId == s.id } }?.id ?: schools.firstOrNull()?.id

    private companion object {
        const val BRANCHES_VIEW = "branches.view"
    }
}
