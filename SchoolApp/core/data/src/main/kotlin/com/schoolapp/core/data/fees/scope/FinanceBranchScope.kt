package com.schoolapp.core.data.fees.scope

import com.schoolapp.core.common.result.AppResult
import com.schoolapp.core.data.organisation.OrganisationRepository
import com.schoolapp.core.model.SessionContext
import com.schoolapp.core.model.organisation.Branch
import java.util.concurrent.atomic.AtomicReference
import javax.inject.Inject
import javax.inject.Singleton

/** The branch a fees / payroll screen works on, with its school (fee heads and sibling discounts are per school). */
data class FinanceBranch(val id: String, val name: String, val schoolId: String?)

/**
 * Branch for fees and payroll: the active role's branch, else (super admin and other global roles) the branch
 * picked in the branch bar, else the first branch in scope. The pick is kept per user and shared by both modules.
 */
@Singleton
class FinanceBranchScope @Inject constructor(private val organisation: OrganisationRepository) {

    private val picked = AtomicReference<Pair<String, String>?>(null)

    /** Current branch, or null when the school has no branch yet. */
    suspend fun current(session: SessionContext): AppResult<FinanceBranch?> {
        val branches = when (val result = organisation.branches()) {
            is AppResult.Failure -> return session.activeBranchId?.let { AppResult.Success(fallback(session, it)) } ?: result
            is AppResult.Success -> result.data
        }
        val wanted = session.activeBranchId ?: pickedFor(session)
        val branch = branches.firstOrNull { it.id == wanted } ?: branches.firstOrNull()
        return AppResult.Success(branch?.toFinance() ?: session.activeBranchId?.let { fallback(session, it) })
    }

    /** Branches a global role may switch between; empty for roles tied to one branch. */
    suspend fun options(session: SessionContext): List<FinanceBranch> {
        if (session.activeBranchId != null) return emptyList()
        return (organisation.branches() as? AppResult.Success)?.data.orEmpty().map { it.toFinance() }
    }

    fun select(session: SessionContext, branchId: String) = picked.set(session.user.id to branchId)

    private fun pickedFor(session: SessionContext): String? = picked.get()?.takeIf { it.first == session.user.id }?.second

    private fun fallback(session: SessionContext, branchId: String) =
        FinanceBranch(branchId, "", session.activeAssignments.firstNotNullOfOrNull { it.schoolId })

    private fun Branch.toFinance() = FinanceBranch(id, name, schoolId)
}
