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
)
