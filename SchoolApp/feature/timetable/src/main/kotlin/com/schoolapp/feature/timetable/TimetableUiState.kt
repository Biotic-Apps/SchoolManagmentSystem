package com.schoolapp.feature.timetable

import androidx.compose.runtime.Immutable
import com.schoolapp.core.common.result.AppError
import com.schoolapp.core.designsystem.component.SwitcherOption
import com.schoolapp.core.model.timetable.TimetableState

/** Teacher/helper: own week. Parent: selected child's section. Supervisor: a picked section. */
enum class TimetableMode { MY_WEEK, CHILD, SECTION }

/** Teachers switch between their own week and the published timetables of the sections they teach. */
enum class TeacherView { WEEK, SECTIONS }

@Immutable
data class TimetableUiState(
    val mode: TimetableMode = TimetableMode.MY_WEEK,
    val isLoading: Boolean = true,
    val isRefreshing: Boolean = false,
    val error: AppError? = null,
    val status: TimetableStatus = TimetableStatus.CONTENT,
    val days: List<DayPlan> = emptyList(),
    val selectedDay: Int = 1,
    /** ISO weekday of today when today is in the shown week. */
    val today: Int? = null,
    /** "Now" / "Next" markers for today's rows, by [ScheduleRow.key]. */
    val markers: Map<String, RowMarker> = emptyMap(),
    val sections: List<SwitcherOption> = emptyList(),
    val selectedSectionId: String? = null,
    val subtitle: String? = null,
    /** Non-null only for teachers, who get the "My week / My sections" switch. */
    val teacherView: TeacherView? = null,
    /** State of the shown section timetable; null in week views. */
    val sectionState: TimetableState? = null,
    val sectionVersion: Int? = null,
    /** Class teacher viewing their own section's draft. */
    val draftNote: Boolean = false,
    /** Lesson whose detail sheet is open. */
    val openLesson: ScheduleRow? = null,
) {
    val showsSections: Boolean get() = mode == TimetableMode.SECTION || teacherView == TeacherView.SECTIONS
    val selectedPlan: DayPlan? get() = days.firstOrNull { it.day == selectedDay }
    val dayRows: List<ScheduleRow> get() = selectedPlan?.rows.orEmpty()
    val hasWeek: Boolean get() = status == TimetableStatus.CONTENT && days.isNotEmpty()

    /** Lifecycle chip for editors; viewers only ever see published timetables. */
    val stateChip: TimetableState? get() = sectionState.takeIf { mode == TimetableMode.SECTION && status == TimetableStatus.CONTENT }

    fun markerFor(row: ScheduleRow): RowMarker? = markers[row.key].takeIf { selectedDay == today }
}
