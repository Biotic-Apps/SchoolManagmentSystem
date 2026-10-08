package com.schoolapp.feature.timetable

import com.schoolapp.core.common.result.AppResult
import com.schoolapp.core.data.organisation.ScopedSections
import com.schoolapp.core.data.timetable.BellScheduleRepository
import com.schoolapp.core.data.timetable.TimetableRepository
import com.schoolapp.core.model.organisation.Section
import com.schoolapp.core.model.timetable.BellSchedule
import com.schoolapp.core.model.timetable.SectionTimetable
import com.schoolapp.core.model.timetable.TimetableState
import kotlinx.coroutines.async
import kotlinx.coroutines.coroutineScope
import javax.inject.Inject

/** Loads one week for each view and decides which state the screen is in (see [TimetableStatus]). */
internal class TimetableLoader @Inject constructor(
    private val repository: TimetableRepository,
    private val bellSchedules: BellScheduleRepository,
    private val scopedSections: ScopedSections,
    private val holidays: WeekHolidays,
) {
    suspend fun sections(): AppResult<List<Section>> = scopedSections.load()

    /** Teacher/helper own week, with breaks and free periods from the branch bell schedule. */
    suspend fun ownWeek(branchId: String?, week: WeekDates): AppResult<TimetableWeek> = coroutineScope {
        val bell = async { branchId?.let { (bellSchedules.schedule(it) as? AppResult.Success)?.data } }
        val closed = async { holidays.forBranch(branchId, week) }
        when (val slots = repository.myWeek(weekOf = week.monday.toString())) {
            is AppResult.Failure -> slots
            is AppResult.Success -> {
                val lessons = ScheduleBuilder.fromSlots(slots.data, showTeacher = false)
                val status = if (lessons.isEmpty()) emptyWeekStatus() else TimetableStatus.CONTENT
                AppResult.Success(TimetableWeek(status, plan(lessons, bell.await(), week, closed.await())))
            }
        }
    }

    /** Parent: the child's published week (bell schedule is not available to parents per branch). */
    suspend fun childWeek(childId: String, week: WeekDates): AppResult<TimetableWeek> = coroutineScope {
        val closed = async { holidays.forChild(childId, week) }
        when (val slots = repository.myWeek(weekOf = week.monday.toString(), studentId = childId)) {
            is AppResult.Failure -> slots
            is AppResult.Success -> {
                val lessons = ScheduleBuilder.fromSlots(slots.data, showTeacher = true)
                val status = if (lessons.isEmpty()) TimetableStatus.NOT_PUBLISHED else TimetableStatus.CONTENT
                AppResult.Success(TimetableWeek(status, plan(lessons, null, week, closed.await())))
            }
        }
    }

    /** A section's week; [editor] (supervisors) also see drafts, viewers only what is published. */
    suspend fun section(sectionId: String, branchId: String?, editor: Boolean, week: WeekDates): AppResult<TimetableWeek> =
        coroutineScope {
            val bell = async { branchId?.let { (bellSchedules.schedule(it) as? AppResult.Success)?.data } }
            val closed = async { holidays.forBranch(branchId, week) }
            when (val result = repository.sectionTimetable(sectionId)) {
                is AppResult.Failure -> result
                is AppResult.Success -> AppResult.Success(sectionWeek(result.data, editor, bell.await(), week, closed.await()))
            }
        }

    private fun sectionWeek(
        timetable: SectionTimetable,
        editor: Boolean,
        bell: BellSchedule?,
        week: WeekDates,
        closed: Map<java.time.LocalDate, String>,
    ): TimetableWeek {
        val draftNote = !editor && timetable.canEdit && !timetable.state.isPublished && timetable.state != TimetableState.EMPTY
        val visible = editor || draftNote || timetable.state.isPublished
        val status = when {
            editor && timetable.state == TimetableState.EMPTY -> TimetableStatus.NOT_CREATED
            !visible || timetable.slots.isEmpty() -> if (editor) TimetableStatus.NOT_CREATED else TimetableStatus.NOT_PUBLISHED
            else -> TimetableStatus.CONTENT
        }
        val lessons = if (visible) ScheduleBuilder.lessonsOf(timetable) else emptyList()
        val days = DayPlanner.week(
            lessons = lessons,
            workingDays = bell?.workingDays.orEmpty(),
            periodsFor = timetable::periodsFor,
            dateFor = week::dateFor,
            holidays = closed,
        )
        return TimetableWeek(status, days, timetable.state, timetable.version, draftNote, sectionEditable = timetable.canEdit)
    }

    /** No lessons: unassigned teachers are told so; otherwise nothing is published yet, or the week is free. */
    private suspend fun emptyWeekStatus(): TimetableStatus {
        val sections = (scopedSections.load() as? AppResult.Success)?.data ?: return TimetableStatus.NOT_PUBLISHED
        if (sections.isEmpty()) return TimetableStatus.NOT_ASSIGNED
        val state = (repository.sectionTimetable(sections.first().id) as? AppResult.Success)?.data?.state
        return if (state?.isPublished == true) TimetableStatus.CONTENT else TimetableStatus.NOT_PUBLISHED
    }

    private fun plan(lessons: List<ScheduleRow>, bell: BellSchedule?, week: WeekDates, closed: Map<java.time.LocalDate, String>) =
        DayPlanner.week(
            lessons = lessons,
            workingDays = bell?.workingDays.orEmpty(),
            periodsFor = { day -> bell?.periodsFor(day).orEmpty() },
            dateFor = week::dateFor,
            holidays = closed,
        )
}
