package com.schoolapp.core.data.organisation

import com.schoolapp.core.common.result.AppResult
import com.schoolapp.core.data.auth.AuthRepository
import com.schoolapp.core.model.organisation.Section
import kotlinx.coroutines.flow.filterNotNull
import kotlinx.coroutines.flow.first
import javax.inject.Inject

/**
 * Sections of the active session in the user's branch. The server scopes the list, so teachers and
 * helpers get only their assigned sections and supervisors get their branch.
 */
class ScopedSections @Inject constructor(
    private val authRepository: AuthRepository,
    private val repository: OrganisationRepository,
) {
    suspend fun load(): AppResult<List<Section>> {
        val session = authRepository.session.filterNotNull().first()
        val branchId = session.activeAssignments.firstNotNullOfOrNull { it.branchId }
            ?: when (val branches = repository.branches()) {
                is AppResult.Failure -> return branches
                is AppResult.Success -> branches.data.firstOrNull()?.id
            }
            ?: return AppResult.Success(emptyList())
        val activeSession = (repository.sessions(branchId) as? AppResult.Success)?.data?.firstOrNull { it.isActive }
        return repository.sections(branchId, activeSession?.id)
    }
}
