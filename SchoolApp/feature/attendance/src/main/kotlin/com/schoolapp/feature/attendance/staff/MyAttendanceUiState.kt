package com.schoolapp.feature.attendance.staff

import androidx.compose.runtime.Immutable
import com.schoolapp.core.common.result.AppError
import com.schoolapp.core.model.attendance.MyStaffAttendance
import java.time.YearMonth

@Immutable
data class MyAttendanceUiState(
    val isLoading: Boolean = true,
    val error: AppError? = null,
    val month: YearMonth = YearMonth.now(),
    val currentMonth: YearMonth = YearMonth.now(),
    val attendance: MyStaffAttendance? = null,
) {
    val canGoNext: Boolean get() = month < currentMonth
}
