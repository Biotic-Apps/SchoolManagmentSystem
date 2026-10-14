package com.schoolapp.feature.notices.compose

import com.schoolapp.core.common.result.AppResult
import com.schoolapp.core.data.organisation.OrganisationRepository
import com.schoolapp.core.designsystem.component.SwitcherOption
import com.schoolapp.core.model.SessionContext
import kotlinx.coroutines.async
import kotlinx.coroutines.coroutineScope
import javax.inject.Inject

/** Branches in scope, the school's classes and the active branch-session's sections (as the web audience builder). */
class AudienceOptionsLoader @Inject constructor(private val organisationRepository: OrganisationRepository) {

    suspend fun load(session: SessionContext): AppResult<AudienceOptions> = coroutineScope {
        val branch = session.activeBranchId
        val schoolId = session.activeAssignments.firstNotNullOfOrNull { it.schoolId }
        val branchesCall = async { organisationRepository.branches() }
        val classesCall = async { organisationRepository.classes(schoolId) }
        val sectionsCall = async {
            if (branch == null) {
                AppResult.Success(emptyList())
            } else {
                val activeSession = (organisationRepository.sessions(branch) as? AppResult.Success)?.data?.firstOrNull { it.isActive }
                organisationRepository.sections(branch, activeSession?.id)
            }
        }
        val branches = branchesCall.await()
        val classes = classesCall.await()
        val sections = sectionsCall.await()
        val error = listOf(branches, classes, sections).firstNotNullOfOrNull { (it as? AppResult.Failure)?.error }
        if (error != null) return@coroutineScope AppResult.Failure(error)
        val sectionList = (sections as AppResult.Success).data.sortedWith(compareBy({ it.className }, { it.name }))
        val classList = (classes as AppResult.Success).data.sortedWith(compareBy({ it.levelOrder ?: Int.MAX_VALUE }, { it.name }))
        val branchList = (branches as AppResult.Success).data
            .filter { schoolId == null || it.schoolId == null || it.schoolId == schoolId }
            .sortedBy { it.name }
        AppResult.Success(
            AudienceOptions(
                branches = branchList.map { SwitcherOption(it.id, it.name) },
                classes = classList.map { SwitcherOption(it.id, it.name) },
                sections = sectionList.map { SwitcherOption(it.id, listOfNotNull(it.className, it.name).joinToString(" - ")) },
            ),
        )
    }
}
