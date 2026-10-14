package com.schoolapp.feature.students.add

import com.schoolapp.core.common.result.AppResult
import com.schoolapp.core.data.organisation.OrganisationRepository
import com.schoolapp.core.model.SessionContext
import javax.inject.Inject

/** Active sections of the active session in the user's branch, labelled "Class 5 · A". */
class SectionOptionsLoader @Inject constructor(private val organisation: OrganisationRepository) {

    data class Options(val branchId: String, val sessionId: String?, val sections: List<SectionOption>)

    suspend fun load(session: SessionContext, branchId: String? = null): AppResult<Options> {
        val branch = branchId ?: session.activeBranchId
            ?: when (val branches = organisation.branches()) {
                is AppResult.Failure -> return branches
                is AppResult.Success -> branches.data.firstOrNull()?.id
            }
            ?: return AppResult.Success(Options("", null, emptyList()))
        val active = when (val sessions = organisation.sessions(branch)) {
            is AppResult.Failure -> return sessions
            is AppResult.Success -> sessions.data.firstOrNull { it.isActive }
        } ?: return AppResult.Success(Options(branch, null, emptyList()))
        return when (val sections = organisation.sections(branch, active.id)) {
            is AppResult.Failure -> sections
            is AppResult.Success -> AppResult.Success(
                Options(
                    branch,
                    active.id,
                    sections.data.filter { it.status == null || it.status == "ACTIVE" }
                        .sortedWith(compareBy({ it.className }, { it.name }))
                        .map {
                            SectionOption(it.id, listOfNotNull(it.className, it.name).joinToString(" · "), it.studentCount, it.capacity, it.classId, it.className)
                        },
                ),
            )
        }
    }
}
