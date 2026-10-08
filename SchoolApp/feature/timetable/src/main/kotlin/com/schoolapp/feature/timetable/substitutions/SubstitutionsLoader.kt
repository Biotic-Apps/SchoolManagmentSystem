package com.schoolapp.feature.timetable.substitutions

import com.schoolapp.core.common.result.AppResult
import com.schoolapp.core.data.organisation.OrganisationRepository
import com.schoolapp.core.data.organisation.ScopedSections
import com.schoolapp.core.data.staff.StaffRepository
import com.schoolapp.core.data.timetable.BellScheduleRepository
import com.schoolapp.core.data.timetable.TimetableRepository
import com.schoolapp.core.designsystem.component.SwitcherOption
import com.schoolapp.core.model.SessionContext
import com.schoolapp.core.model.timetable.BellSchedule
import com.schoolapp.core.model.timetable.TimetableOverride
import kotlinx.coroutines.async
import kotlinx.coroutines.coroutineScope
import javax.inject.Inject

/** Pickers and labels for substitutions: the branch's sections, bell schedule and active teachers. */
internal data class SubstitutionLookups(
    val sections: List<SwitcherOption> = emptyList(),
    val schedule: BellSchedule? = null,
    val teachers: List<SwitcherOption> = emptyList(),
)

/** Loads one day's substitutions plus [SubstitutionLookups]; lookups that fail only cost nicer labels. */
internal class SubstitutionsLoader @Inject constructor(
    private val repository: TimetableRepository,
    private val organisation: OrganisationRepository,
    private val scopedSections: ScopedSections,
    private val bellSchedules: BellScheduleRepository,
    private val staff: StaffRepository,
) {
    /** The active assignment's branch; global roles (super admin) fall back to the first scoped branch. */
    suspend fun branchId(session: SessionContext): AppResult<String?> {
        session.activeBranchId?.let { return AppResult.Success(it) }
        return when (val branches = organisation.branches()) {
            is AppResult.Failure -> branches
            is AppResult.Success -> AppResult.Success(branches.data.firstOrNull()?.id)
        }
    }

    suspend fun day(branchId: String, date: String): AppResult<List<TimetableOverride>> = repository.overrides(branchId, date)

    suspend fun lookups(branchId: String): SubstitutionLookups = coroutineScope {
        val sections = async { (scopedSections.load() as? AppResult.Success)?.data.orEmpty() }
        val bell = async { (bellSchedules.schedule(branchId) as? AppResult.Success)?.data }
        val teachers = async { (staff.staff(search = null) as? AppResult.Success)?.data.orEmpty() }
        SubstitutionLookups(
            sections = sections.await()
                .sortedWith(compareBy({ it.className }, { it.name }))
                .map { SwitcherOption(it.id, listOfNotNull(it.className, it.name).joinToString(" · ")) },
            schedule = bell.await(),
            teachers = teachers.await()
                .filter { TEACHER in it.roles && it.status.isActive() && (it.branchId == null || it.branchId == branchId) }
                .sortedBy { it.name }
                .map { SwitcherOption(it.id, it.name) },
        )
    }

    private fun String?.isActive(): Boolean = this == null || equals(ACTIVE, ignoreCase = true)

    private companion object {
        const val TEACHER = "TEACHER"
        const val ACTIVE = "ACTIVE"
    }
}
