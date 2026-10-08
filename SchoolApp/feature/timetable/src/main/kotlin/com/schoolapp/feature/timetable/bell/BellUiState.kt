package com.schoolapp.feature.timetable.bell

import androidx.compose.runtime.Immutable
import com.schoolapp.core.common.result.AppError
import com.schoolapp.core.data.common.ActionError

/** One editable bell row in 24-hour "HH:mm"; teaching rows are numbered, only breaks carry a [label]. */
@Immutable
data class BellRow(val startTime: String, val endTime: String, val isBreak: Boolean = false, val label: String = "")

/** Rows of one schedule; [day] 0 = every working day, 1–7 = that weekday's own times (5 = Friday). */
@Immutable
data class DaySchedule(val day: Int, val rows: List<BellRow>)

enum class RowProblem { END_BEFORE_START, OVERLAPS_PREVIOUS }

/** "Generate…" helper: N periods of M minutes from a start time, one break after period K. */
@Immutable
data class GeneratorForm(
    val startTime: String = "08:00",
    val periodMinutes: String = "40",
    val periodsPerDay: String = "8",
    val breakAfter: String = "4",
    val breakMinutes: String = "30",
    val invalid: Boolean = false,
)

@Immutable
data class BellUiState(
    val isLoading: Boolean = true,
    val loadError: AppError? = null,
    val branchId: String? = null,
    val workingDays: List<Int> = emptyList(),
    val schedules: List<DaySchedule> = emptyList(),
    val selectedDay: Int = 0,
    val canEdit: Boolean = false,
    val dirty: Boolean = false,
    val saving: Boolean = false,
    val saved: Boolean = false,
    /** Problems by row index of the selected schedule, shown after a save attempt. */
    val problems: Map<Int, RowProblem> = emptyMap(),
    val emptySchedule: Boolean = false,
    val error: ActionError? = null,
    /** 409 PERIODS_IN_USE: lessons that would be removed; non-null shows the confirm dialog. */
    val lessonsToDrop: List<String>? = null,
    val generator: GeneratorForm? = null,
) {
    val current: DaySchedule? get() = schedules.firstOrNull { it.day == selectedDay } ?: schedules.firstOrNull()

    /** Working days that can still get their own times. */
    val variantCandidates: List<Int> get() = workingDays.filter { day -> schedules.none { it.day == day } }
}
