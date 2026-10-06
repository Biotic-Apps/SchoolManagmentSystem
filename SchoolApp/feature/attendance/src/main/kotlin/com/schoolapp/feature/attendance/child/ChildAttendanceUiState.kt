package com.schoolapp.feature.attendance.child

import androidx.compose.runtime.Immutable
import com.schoolapp.core.common.result.AppError
import com.schoolapp.core.model.attendance.AttendanceDay
import com.schoolapp.core.model.attendance.AttendanceStatus
import com.schoolapp.core.model.attendance.StudentAttendance
import java.time.YearMonth

@Immutable
data class ChildAttendanceUiState(
    val isLoading: Boolean = true,
    val error: AppError? = null,
    val childId: String? = null,
    val childName: String? = null,
    val month: YearMonth = YearMonth.now(),
    val currentMonth: YearMonth = YearMonth.now(),
    val today: String = "",
    val history: StudentAttendance? = null,
) {
    val canGoNext: Boolean get() = month < currentMonth

    val statusByDate: Map<String, AttendanceStatus?> get() = history?.days.orEmpty().associate { it.date to it.status }

    /** Days with a mark, newest first. */
    val markedDays: List<AttendanceDay> get() = history?.days.orEmpty().filter { it.status != null }.sortedByDescending { it.date }
}
