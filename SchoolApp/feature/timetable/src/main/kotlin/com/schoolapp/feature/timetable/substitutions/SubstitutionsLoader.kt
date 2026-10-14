package com.schoolapp.feature.timetable.substitutions

import com.schoolapp.core.common.result.AppResult
import com.schoolapp.core.data.organisation.OrganisationRepository
import com.schoolapp.core.data.staff.StaffRepository
import com.schoolapp.core.data.timetable.BellScheduleRepository
import com.schoolapp.core.data.timetable.TimetableRepository
import com.schoolapp.core.designsystem.component.SwitcherOption
import com.schoolapp.core.model.SessionContext
import com.schoolapp.core.model.timetable.BellSchedule
import com.schoolapp.core.model.timetable.TimetableOverride
import com.schoolapp.feature.timetable.scope.TimetableBranchScope
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
    private val scope: TimetableBranchScope,
    private val bellSchedules: BellScheduleRepository,
    private val staff: StaffRepository,
) {
    /** The active assignment's branch; global roles (super admin) use the branch picked in the timetable's branch bar. */
    suspend fun branchId(session: SessionContext): AppResult<String?> = scope.branchId(session)

    suspend fun day(branchId: String, date: String): AppResult<List<TimetableOverride>> = repository.overrides(branchId, date)

    suspend fun lookups(branchId: String): SubstitutionLookups = coroutineScope {
        val sections = async { branchSections(branchId) }
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

    /** Sections of the branch's active session (the picked branch, not only the role's own). */
    private suspend fun branchSections(branchId: String): List<com.schoolapp.core.model.organisation.Section> {
        val session = (organisation.sessions(branchId) as? AppResult.Success)?.data?.firstOrNull { it.isActive }
        return (organisation.sections(branchId, session?.id) as? AppResult.Success)?.data.orEmpty()
    }

    private fun String?.isActive(): Boolean = this == null || equals(ACTIVE, ignoreCase = true)

    private companion object {
        const val TEACHER = "TEACHER"
        const val ACTIVE = "ACTIVE"
    }
}
