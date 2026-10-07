package com.schoolapp.feature.meetings.staff.slots

import androidx.compose.runtime.Immutable
import com.schoolapp.core.common.result.AppError
import com.schoolapp.core.model.meeting.MeetingSlot
import com.schoolapp.feature.meetings.book.SlotDay
import com.schoolapp.feature.meetings.domain.SlotProblem
import com.schoolapp.feature.meetings.domain.SlotsForm

/** Last finished slot action, shown as a success message. */
sealed interface SlotsNotice {
    data class Published(val count: Int) : SlotsNotice
    data object Removed : SlotsNotice
}

/** "Add slots" sheet; [minDate] (today) is the earliest date the picker offers. */
@Immutable
data class PublishSlotsSheetState(
    val form: SlotsForm,
    val minDate: String,
    val problems: Map<Int, Set<SlotProblem>> = emptyMap(),
    val isSaving: Boolean = false,
    val error: AppError? = null,
)

/** "My slots" tab: the caller's slots one week (Monday to Sunday, `YYYY-MM-DD`) at a time. */
@Immutable
data class MySlotsUiState(
    /** Staff with `meetings.add`; everyone else never sees the tab. */
    val canPublish: Boolean = false,
    val isLoading: Boolean = true,
    val isRefreshing: Boolean = false,
    val error: AppError? = null,
    val weekStart: String = "",
    val weekEnd: String = "",
    val isThisWeek: Boolean = true,
    val days: List<SlotDay> = emptyList(),
    val sheet: PublishSlotsSheetState? = null,
    val deleteTarget: MeetingSlot? = null,
    val deletingId: String? = null,
    val actionError: AppError? = null,
    val notice: SlotsNotice? = null,
)
