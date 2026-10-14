package com.schoolapp.feature.admissions.common

import com.schoolapp.core.common.result.AppError
import com.schoolapp.core.common.result.AppResult
import com.schoolapp.core.data.auth.AuthRepository
import com.schoolapp.core.data.organisation.OrganisationRepository
import com.schoolapp.feature.admissions.create.ClassChoice
import kotlinx.coroutines.flow.filterNotNull
import kotlinx.coroutines.flow.first
import javax.inject.Inject

/** Branch, active session and classes new enquiries and applications are taken for. */
data class AdmissionScope(
    val branchId: String?,
    val sessionId: String?,
    val classes: List<ClassChoice>,
    val error: AppError? = null,
)

/** Resolves the user's branch (first assigned, else first visible) and its ACTIVE session, like the web scope bar. */
class AdmissionScopeLoader @Inject constructor(
    private val organisation: OrganisationRepository,
    private val authRepository: AuthRepository,
) {
    suspend fun load(): AdmissionScope {
        val session = authRepository.session.filterNotNull().first()
        val branch = session.activeBranchId?.let { id -> id to session.activeAssignments.firstNotNullOfOrNull { it.schoolId } }
            ?: (organisation.branches() as? AppResult.Success)?.data?.firstOrNull()?.let { it.id to it.schoolId }
        val active = branch?.let { (organisation.sessions(it.first) as? AppResult.Success)?.data?.firstOrNull { s -> s.isActive } }
        return when (val classes = organisation.classes(branch?.second)) {
            is AppResult.Failure -> AdmissionScope(branch?.first, active?.id, emptyList(), classes.error)
            is AppResult.Success -> AdmissionScope(branch?.first, active?.id, classes.data.map { ClassChoice(it.id, it.name) })
        }
    }
}
