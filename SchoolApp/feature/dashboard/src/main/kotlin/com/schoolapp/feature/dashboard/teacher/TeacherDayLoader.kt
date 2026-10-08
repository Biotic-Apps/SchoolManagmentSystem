package com.schoolapp.feature.dashboard.teacher

import com.schoolapp.core.common.result.AppResult
import com.schoolapp.core.common.time.AppClock
import com.schoolapp.core.data.dashboard.DashboardRepository
import com.schoolapp.core.data.organisation.ScopedSections
import com.schoolapp.core.navigation.AttendanceRegisterDestination
import com.schoolapp.core.navigation.DiaryEditorDestination
import com.schoolapp.feature.dashboard.TodayPeriodsLoader
import com.schoolapp.feature.dashboard.todayPeriods
import javax.inject.Inject

/** Builds [TeacherDay] from `/dashboard/teacher-today`, falling back to `/timetables/me` for the periods. */
class TeacherDayLoader @Inject constructor(
    private val repository: DashboardRepository,
    private val periodsLoader: TodayPeriodsLoader,
    private val scopedSections: ScopedSections,
    private val clock: AppClock,
) {
    suspend fun load(): TeacherDay {
        val now = clock.now()
        val today = now.toLocalDate().toString()
        val data = when (val result = repository.teacherToday()) {
            is AppResult.Failure -> return TeacherDay(periods = fallbackPeriods(), error = result.error)
            is AppResult.Success -> result.data
        }
        val periods = if (data.periods.isNotEmpty()) todayPeriods(data.periods, now) else fallbackPeriods()
        val sections = (scopedSections.load() as? AppResult.Success)?.data
        val labels = sections.orEmpty().associate { section -> section.id to listOfNotNull(section.className, section.name).joinToString(" - ") }
        val setup = when {
            periods.isNotEmpty() || data.registers.isNotEmpty() || data.diariesPending.isNotEmpty() -> TeacherSetup.READY
            sections?.isEmpty() == true -> TeacherSetup.NOT_ASSIGNED
            sections == null -> TeacherSetup.READY
            periodsLoader.isPublished(sections.first().id) == false -> TeacherSetup.NOT_PUBLISHED
            else -> TeacherSetup.READY
        }
        return TeacherDay(
            periods = periods,
            setup = setup,
            registers = data.registers.map { register ->
                val label = register.sectionLabel ?: labels[register.sectionId]
                RegisterRow(
                    sectionId = register.sectionId,
                    label = label,
                    status = register.status,
                    destination = AttendanceRegisterDestination(register.sectionId, today, label.orEmpty()),
                )
            },
            diariesPending = data.diariesPending.map { slot ->
                val label = slot.sectionLabel ?: labels[slot.sectionId]
                PendingDiaryRow(
                    sectionLabel = label,
                    subjectName = slot.subjectName,
                    destination = DiaryEditorDestination(
                        sectionId = slot.sectionId,
                        date = today,
                        subjectId = slot.subjectId,
                        title = listOfNotNull(label, slot.subjectName).joinToString(" · ").ifBlank { null },
                    ),
                )
            },
            unreadMessages = data.unreadMessages,
            assignedComplaints = data.assignedComplaints,
        )
    }

    private suspend fun fallbackPeriods() = (periodsLoader.load() as? AppResult.Success)?.data.orEmpty()

}
