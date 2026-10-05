package com.schoolapp.feature.organisation.sessions

import androidx.compose.runtime.Immutable
import com.schoolapp.core.common.result.AppError
import com.schoolapp.core.model.organisation.AcademicSession
import com.schoolapp.core.model.organisation.BranchOption
import com.schoolapp.core.model.organisation.CalendarEvent

@Immutable
data class SessionsCalendarUiState(
    val isLoading: Boolean = true,
    val branches: List<BranchOption> = emptyList(),
    val selectedBranchId: String? = null,
    val sessions: List<AcademicSession> = emptyList(),
    val events: List<CalendarEvent> = emptyList(),
    val error: AppError? = null,
) {
    val activeSession: AcademicSession? get() = sessions.firstOrNull { it.isActive }
}
