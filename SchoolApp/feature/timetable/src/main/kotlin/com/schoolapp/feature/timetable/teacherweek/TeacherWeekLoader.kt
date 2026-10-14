package com.schoolapp.feature.timetable.teacherweek

import com.schoolapp.core.common.result.AppResult
import com.schoolapp.core.data.timetable.BellScheduleRepository
import com.schoolapp.core.data.timetable.TeacherTimetableRepository
import com.schoolapp.feature.timetable.DayPlanner
import com.schoolapp.feature.timetable.ScheduleBuilder
import com.schoolapp.feature.timetable.TimetableStatus
import com.schoolapp.feature.timetable.TimetableWeek
import com.schoolapp.feature.timetable.WeekDates
import com.schoolapp.feature.timetable.WeekHolidays
import kotlinx.coroutines.async
import kotlinx.coroutines.coroutineScope
import javax.inject.Inject

/** One teacher's week in the branch's bell schedule (breaks and free periods), with holidays marked. */
internal class TeacherWeekLoader @Inject constructor(
    private val repository: TeacherTimetableRepository,
    private val bellSchedules: BellScheduleRepository,
    private val holidays: WeekHolidays,
) {
    suspend fun week(staffId: String, branchId: String?, week: WeekDates): AppResult<TimetableWeek> = coroutineScope {
        val bell = async { branchId?.let { (bellSchedules.schedule(it) as? AppResult.Success)?.data } }
        val closed = async { holidays.forBranch(branchId, week) }
        when (val slots = repository.week(staffId, week.monday.toString())) {
            is AppResult.Failure -> slots
            is AppResult.Success -> {
                val lessons = ScheduleBuilder.fromSlots(slots.data, showTeacher = false)
                val schedule = bell.await()
                val days = DayPlanner.week(
                    lessons = lessons,
                    workingDays = schedule?.workingDays.orEmpty(),
                    periodsFor = { day -> schedule?.periodsFor(day).orEmpty() },
                    dateFor = week::dateFor,
                    holidays = closed.await(),
                )
                AppResult.Success(TimetableWeek(if (lessons.isEmpty()) TimetableStatus.TEACHER_FREE else TimetableStatus.CONTENT, days))
            }
        }
    }
}
