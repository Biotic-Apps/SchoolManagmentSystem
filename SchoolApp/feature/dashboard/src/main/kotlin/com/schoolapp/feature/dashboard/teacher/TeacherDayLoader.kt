package com.schoolapp.feature.dashboard.teacher

import com.schoolapp.core.common.result.AppResult
import com.schoolapp.core.common.time.AppClock
import com.schoolapp.core.data.dashboard.DashboardRepository
import com.schoolapp.core.data.organisation.ScopedSections
import com.schoolapp.core.model.dashboard.TeacherToday
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
        val labels = if (data.needsLabels()) sectionLabels() else emptyMap()
        return TeacherDay(
            periods = periods,
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

    private suspend fun sectionLabels(): Map<String, String> =
        (scopedSections.load() as? AppResult.Success)?.data.orEmpty().associate { section ->
            section.id to listOfNotNull(section.className, section.name).joinToString(" - ")
        }

    private fun TeacherToday.needsLabels() =
        registers.any { it.sectionLabel == null } || diariesPending.any { it.sectionLabel == null }
}
