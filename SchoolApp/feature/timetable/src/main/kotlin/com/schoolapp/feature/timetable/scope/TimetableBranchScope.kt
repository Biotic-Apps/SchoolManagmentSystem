package com.schoolapp.feature.timetable.scope

import com.schoolapp.core.common.result.AppResult
import com.schoolapp.core.data.organisation.OrganisationRepository
import com.schoolapp.core.designsystem.component.SwitcherOption
import com.schoolapp.core.model.SessionContext
import java.util.concurrent.atomic.AtomicReference
import javax.inject.Inject
import javax.inject.Singleton

/**
 * The branch every timetable tab works on: the active role's branch, else (super admin and other global roles)
 * the branch picked in the timetable's branch bar, else the first branch in scope. The pick is kept per user.
 */
@Singleton
class TimetableBranchScope @Inject constructor(private val organisation: OrganisationRepository) {

    private val picked = AtomicReference<Pair<String, String>?>(null)

    suspend fun branchId(session: SessionContext): AppResult<String?> {
        session.activeBranchId?.let { return AppResult.Success(it) }
        pickedFor(session)?.let { return AppResult.Success(it) }
        return when (val branches = organisation.branches()) {
            is AppResult.Failure -> branches
            is AppResult.Success -> AppResult.Success(branches.data.firstOrNull()?.id)
        }
    }

    /** Branches a global role may switch between; empty for roles tied to one branch. */
    suspend fun options(session: SessionContext): List<SwitcherOption> {
        if (session.activeBranchId != null) return emptyList()
        val branches = (organisation.branches() as? AppResult.Success)?.data.orEmpty()
        return branches.map { SwitcherOption(it.id, it.name) }
    }

    fun select(session: SessionContext, branchId: String) = picked.set(session.user.id to branchId)

    private fun pickedFor(session: SessionContext): String? = picked.get()?.takeIf { it.first == session.user.id }?.second
}
