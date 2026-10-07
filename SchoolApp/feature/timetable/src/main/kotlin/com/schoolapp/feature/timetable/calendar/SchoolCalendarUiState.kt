package com.schoolapp.feature.timetable.calendar

import androidx.compose.runtime.Immutable
import com.schoolapp.core.common.result.AppError
import com.schoolapp.core.model.organisation.CalendarEvent

/** Parent: upcoming school calendar (holidays, vacations, events, deadlines) for the active child, earliest first. */
@Immutable
data class SchoolCalendarUiState(
    val childId: String? = null,
    val childName: String? = null,
    val isLoading: Boolean = true,
    val isRefreshing: Boolean = false,
    val error: AppError? = null,
    val events: List<CalendarEvent> = emptyList(),
    val days: Int = SchoolCalendarViewModel.DAYS_AHEAD,
)
