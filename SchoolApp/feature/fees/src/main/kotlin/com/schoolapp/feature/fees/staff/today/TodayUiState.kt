package com.schoolapp.feature.fees.staff.today

import androidx.compose.runtime.Immutable
import com.schoolapp.core.common.result.AppError
import com.schoolapp.core.model.fees.DailyCollection
import com.schoolapp.core.model.fees.FinanceOverview

@Immutable
data class TodayUiState(
    val isLoading: Boolean = true,
    val isRefreshing: Boolean = false,
    val error: AppError? = null,
    val today: String = "",
    val overview: FinanceOverview? = null,
    val collection: DailyCollection? = null,
    val queuedPayments: Int = 0,
    val canRecord: Boolean = false,
    /** `fees.approve`: close the day with a cash count. */
    val canCloseDay: Boolean = false,
    val closeForm: CloseDayForm? = null,
) {
    val showCloseDay: Boolean get() = canCloseDay && collection != null && collection.closing == null
}

/** Close-day sheet: counted cash and an optional note; confirmed before sending. */
@Immutable
data class CloseDayForm(
    val cash: String = "",
    val note: String = "",
    val cashInvalid: Boolean = false,
    val confirming: Boolean = false,
    val isSaving: Boolean = false,
    val error: AppError? = null,
)
