package com.schoolapp.feature.timetable.teacherweek

import androidx.compose.runtime.Immutable
import com.schoolapp.core.common.result.AppError
import com.schoolapp.core.model.academics.TeachingStaff
import com.schoolapp.feature.timetable.TimetableStatus
import com.schoolapp.feature.timetable.TimetableUiState
import java.time.LocalDate

/** "Teacher week" tab: pick a teacher and a week; [timetable] is rendered by the shared timetable screen. */
@Immutable
data class TeacherWeekUiState(
    val teachersLoading: Boolean = true,
    val teachersError: AppError? = null,
    val teachers: List<TeachingStaff> = emptyList(),
    val staffId: String? = null,
    val monday: LocalDate? = null,
    /** Monday of the current week, to tell "This week" apart. */
    val thisMonday: LocalDate? = null,
    val timetable: TimetableUiState = TimetableUiState(isLoading = false, status = TimetableStatus.CHOOSE_TEACHER),
) {
    val isThisWeek: Boolean get() = monday == thisMonday
    val teacherName: String? get() = teachers.firstOrNull { it.id == staffId }?.name
}
