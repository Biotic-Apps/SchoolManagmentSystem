package com.schoolapp.feature.reports.form

import com.schoolapp.core.common.result.AppResult
import com.schoolapp.core.common.result.map
import com.schoolapp.core.data.exams.ExamsRepository
import com.schoolapp.core.data.organisation.OrganisationRepository
import com.schoolapp.core.designsystem.component.SwitcherOption
import com.schoolapp.core.model.organisation.Branch
import javax.inject.Inject

/** Choices for branch / school / exam params; schools are derived from the branches the caller can see. */
class ReportOptionsLoader @Inject constructor(
    private val organisation: OrganisationRepository,
    private val exams: ExamsRepository,
) {
    suspend fun branches(): AppResult<List<Branch>> = organisation.branches()

    suspend fun exams(branchId: String?): AppResult<List<SwitcherOption>> =
        exams.exams(branchId = branchId).map { list ->
            list.map { SwitcherOption(it.id, it.name, it.termName) }.sortedBy { it.label.lowercase() }
        }
}

internal fun List<Branch>.branchOptions(): List<SwitcherOption> =
    map { SwitcherOption(it.id, it.name, it.schoolName) }.sortedBy { it.label.lowercase() }

internal fun List<Branch>.schoolOptions(): List<SwitcherOption> =
    mapNotNull { branch -> branch.schoolId?.let { SwitcherOption(it, branch.schoolName ?: branch.name) } }
        .distinctBy { it.id }
        .sortedBy { it.label.lowercase() }
