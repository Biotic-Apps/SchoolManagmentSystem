package com.schoolapp.feature.dashboard

import androidx.compose.runtime.Immutable
import com.schoolapp.core.common.result.AppError
import com.schoolapp.core.model.RoleRef
import com.schoolapp.core.model.dashboard.DashboardMetric

sealed interface DashboardUiState {
    data object Loading : DashboardUiState

    @Immutable
    data class Summary(
        val userName: String,
        val scopeName: String?,
        val metrics: List<DashboardMetric>,
        val isRefreshing: Boolean = false,
    ) : DashboardUiState

    /** Roles without a summary yet (teacher, parent, ...) see who/where they are signed in as. */
    @Immutable
    data class Welcome(
        val userName: String,
        val role: RoleRef,
        val roleName: String?,
        val branchName: String?,
        val schoolName: String?,
        /** Teacher/helper only: today's periods from `/timetables/me`; null for other roles. */
        val todayPeriods: List<TodayPeriod>? = null,
    ) : DashboardUiState

    data class Error(val error: AppError) : DashboardUiState
}

@Immutable
data class TodayPeriod(
    val periodIndex: Int,
    val timeRange: String,
    val title: String,
    val subtitle: String?,
    val isSubstitute: Boolean,
    val isCurrent: Boolean,
)
