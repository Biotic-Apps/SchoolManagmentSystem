package com.schoolapp.feature.organisation.scope

import com.schoolapp.core.common.result.AppResult
import com.schoolapp.core.common.result.map
import com.schoolapp.core.data.auth.AuthRepository
import com.schoolapp.core.data.organisation.OrganisationRepository
import com.schoolapp.core.model.SessionContext
import com.schoolapp.core.model.organisation.BranchOption
import kotlinx.coroutines.flow.filterNotNull
import kotlinx.coroutines.flow.first
import javax.inject.Inject

/**
 * Branches the user may browse: the scoped `/branches` list when they hold `branches.view`,
 * otherwise the branches of their active role assignments (e.g. coordinators).
 */
class BranchOptionsLoader @Inject constructor(
    private val authRepository: AuthRepository,
    private val repository: OrganisationRepository,
) {
    data class Options(val branches: List<BranchOption>, val preferredId: String?)

    suspend fun load(): AppResult<Options> {
        val session = authRepository.session.filterNotNull().first()
        val preferred = session.activeAssignments.firstNotNullOfOrNull { it.branchId }
        if (!session.has(BRANCHES_VIEW)) return AppResult.Success(Options(session.assignmentBranches(), preferred))
        return repository.branches().map { list ->
            Options(list.map { BranchOption(it.id, it.name, it.schoolId) }, preferred)
        }
    }

    private fun SessionContext.assignmentBranches(): List<BranchOption> =
        activeAssignments.mapNotNull { a -> a.branchId?.let { BranchOption(it, a.branchName ?: it, a.schoolId) } }
            .distinctBy { it.id }

    private companion object {
        const val BRANCHES_VIEW = "branches.view"
    }
}
