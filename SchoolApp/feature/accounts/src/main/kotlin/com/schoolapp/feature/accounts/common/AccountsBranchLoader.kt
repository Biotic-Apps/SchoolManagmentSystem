package com.schoolapp.feature.accounts.common

import com.schoolapp.core.common.result.AppResult
import com.schoolapp.core.common.result.map
import com.schoolapp.core.data.organisation.OrganisationRepository
import com.schoolapp.core.model.SessionContext
import com.schoolapp.core.model.organisation.BranchOption
import javax.inject.Inject

/**
 * Branches accounts are tracked for: the scoped `/branches` list when the role holds `branches.view`
 * (super admin, principal), otherwise the branches of the active role assignments (e.g. accountants).
 */
class AccountsBranchLoader @Inject constructor(
    private val repository: OrganisationRepository,
) {
    data class Options(val branches: List<BranchOption>, val preferredId: String?)

    suspend fun load(session: SessionContext): AppResult<Options> {
        val preferred = session.activeBranchId
        val own = session.assignmentBranches()
        if (!session.has(BRANCHES_VIEW)) return AppResult.Success(Options(own, preferred))
        return repository.branches().map { list ->
            val branches = list.map { BranchOption(it.id, it.name, it.schoolId) }
            Options(branches.ifEmpty { own }, preferred)
        }
    }

    private fun SessionContext.assignmentBranches(): List<BranchOption> =
        activeAssignments.mapNotNull { a -> a.branchId?.let { BranchOption(it, a.branchName ?: it, a.schoolId) } }
            .distinctBy { it.id }

    private companion object {
        const val BRANCHES_VIEW = "branches.view"
    }
}
