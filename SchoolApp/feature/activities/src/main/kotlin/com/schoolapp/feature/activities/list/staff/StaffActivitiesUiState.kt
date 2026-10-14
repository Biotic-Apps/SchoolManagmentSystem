package com.schoolapp.feature.activities.list.staff

import androidx.compose.runtime.Immutable
import com.schoolapp.core.common.result.AppError
import com.schoolapp.core.model.activity.ActivityFilter
import com.schoolapp.feature.activities.list.ActivityItem
import java.time.LocalDate
import java.time.YearMonth

enum class StaffView { LIST, CALENDAR }

/** Paged list (newest first) for the chosen type / status. */
@Immutable
data class ActivityPageState(
    val items: List<ActivityItem> = emptyList(),
    val page: Int = 0,
    val total: Int = 0,
    val isLoading: Boolean = true,
    val isRefreshing: Boolean = false,
    val isLoadingMore: Boolean = false,
    val error: AppError? = null,
    val loadMoreError: AppError? = null,
) {
    val hasMore: Boolean get() = page > 0 && items.size < total
}

/** One month: activities per local day (multi-day activities appear on every day they cover). */
@Immutable
data class MonthState(
    val month: YearMonth,
    val byDay: Map<LocalDate, List<ActivityItem>> = emptyMap(),
    val selectedDay: LocalDate? = null,
    val isLoading: Boolean = true,
    val error: AppError? = null,
) {
    val selectedItems: List<ActivityItem> get() = selectedDay?.let { byDay[it] }.orEmpty()
}

@Immutable
data class StaffActivitiesUiState(
    val filter: ActivityFilter = ActivityFilter(),
    val view: StaffView = StaffView.LIST,
    val list: ActivityPageState = ActivityPageState(),
    val month: MonthState = MonthState(YearMonth.now()),
    val canPropose: Boolean = false,
)
