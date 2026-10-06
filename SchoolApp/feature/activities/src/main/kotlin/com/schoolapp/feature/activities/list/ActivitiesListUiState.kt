package com.schoolapp.feature.activities.list

import androidx.compose.runtime.Immutable
import com.schoolapp.core.common.result.AppError
import com.schoolapp.core.model.activity.Activity

enum class ActivitiesTab { UPCOMING, PAST }

/** One row; [timeRange] is pre-formatted (12-hour) off the UI thread. */
@Immutable
data class ActivityItem(
    val activity: Activity,
    val timeRange: String,
    val consentNeeded: Boolean = false,
)

@Immutable
data class ActivitiesListUiState(
    val isLoading: Boolean = true,
    val isRefreshing: Boolean = false,
    val error: AppError? = null,
    val isParent: Boolean = false,
    val noChild: Boolean = false,
    val canPropose: Boolean = false,
    val tab: ActivitiesTab = ActivitiesTab.UPCOMING,
    val awaitingApproval: List<ActivityItem> = emptyList(),
    val upcoming: List<ActivityItem> = emptyList(),
    val past: List<ActivityItem> = emptyList(),
) {
    val visible: List<ActivityItem> get() = if (tab == ActivitiesTab.UPCOMING) upcoming else past
}
