package com.schoolapp.feature.dashboard.teacher

import androidx.compose.runtime.Immutable
import com.schoolapp.core.common.result.AppError
import com.schoolapp.core.model.attendance.RegisterStatus
import com.schoolapp.core.navigation.AttendanceRegisterDestination
import com.schoolapp.core.navigation.DiaryEditorDestination
import com.schoolapp.feature.dashboard.TodayPeriod

/** Teacher/helper "Today"; counters are null when `/dashboard/teacher-today` failed ([error] set). */
/** Why a teacher's day may be empty: honest onboarding instead of "all done". */
enum class TeacherSetup { READY, NOT_ASSIGNED, NOT_PUBLISHED }

@Immutable
data class TeacherDay(
    val periods: List<TodayPeriod>,
    val setup: TeacherSetup = TeacherSetup.READY,
    val registers: List<RegisterRow> = emptyList(),
    val diariesPending: List<PendingDiaryRow> = emptyList(),
    val unreadMessages: Int? = null,
    val assignedComplaints: Int? = null,
    val error: AppError? = null,
) {
    /** Diaries are due when the teacher has lessons today. */
    val hasDiariesDue: Boolean get() = periods.isNotEmpty() || diariesPending.isNotEmpty()
}

/** One section's register today; [label] null = section name unknown. */
@Immutable
data class RegisterRow(
    val sectionId: String,
    val label: String?,
    val status: RegisterStatus,
    val destination: AttendanceRegisterDestination,
)

@Immutable
data class PendingDiaryRow(
    val sectionLabel: String?,
    val subjectName: String?,
    val destination: DiaryEditorDestination,
)
