package com.schoolapp.feature.timetable

import androidx.compose.runtime.Immutable
import com.schoolapp.core.common.result.AppError
import com.schoolapp.core.designsystem.component.SwitcherOption

/** Teacher/helper: own week. Parent: selected child's section. Supervisor: a picked section. */
enum class TimetableMode { MY_WEEK, CHILD, SECTION }

@Immutable
data class TimetableUiState(
    val mode: TimetableMode = TimetableMode.MY_WEEK,
    val isLoading: Boolean = true,
    val error: AppError? = null,
    val rows: List<ScheduleRow> = emptyList(),
    val days: List<Int> = emptyList(),
    val selectedDay: Int = 1,
    val today: Int = 1,
    /** Running period on [today], highlighted only when that day is shown. */
    val currentPeriodIndex: Int? = null,
    val sections: List<SwitcherOption> = emptyList(),
    val selectedSectionId: String? = null,
    val subtitle: String? = null,
) {
    val dayRows: List<ScheduleRow> get() = rows.filter { it.day == selectedDay }
    val highlightedPeriod: Int? get() = currentPeriodIndex.takeIf { selectedDay == today }
}
