package com.schoolapp.feature.organisation.sessions

import androidx.compose.runtime.Immutable
import com.schoolapp.core.common.result.AppError
import com.schoolapp.core.model.organisation.AcademicSession
import com.schoolapp.core.model.organisation.BranchOption
import com.schoolapp.core.model.organisation.CalendarEvent
import java.time.YearMonth

@Immutable
data class SessionsCalendarUiState(
    val isLoading: Boolean = true,
    val isRefreshing: Boolean = false,
    val branches: List<BranchOption> = emptyList(),
    val selectedBranchId: String? = null,
    val sessions: List<AcademicSession> = emptyList(),
    /** Calendar entries of [month] (school-wide and this branch). */
    val month: YearMonth = YearMonth.now(),
    val events: List<CalendarEvent> = emptyList(),
    val eventsLoading: Boolean = false,
    val error: AppError? = null,
    /** `sessions.add`: new sessions. */
    val canAddSession: Boolean = false,
    /** `sessions.edit`: edit / activate / close sessions, terms and calendar entries. */
    val canEdit: Boolean = false,
) {
    val activeSession: AcademicSession? get() = sessions.firstOrNull { it.isActive }
    val hasContent: Boolean get() = sessions.isNotEmpty() || events.isNotEmpty()
    val schoolId: String? get() = branches.firstOrNull { it.id == selectedBranchId }?.schoolId
}
