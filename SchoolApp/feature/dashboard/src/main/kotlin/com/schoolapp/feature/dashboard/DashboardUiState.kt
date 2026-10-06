package com.schoolapp.feature.dashboard

import androidx.compose.runtime.Immutable
import com.schoolapp.core.common.result.AppError
import com.schoolapp.core.model.ChildSummary
import com.schoolapp.core.model.RoleRef
import com.schoolapp.core.model.dashboard.DashboardMetric
import com.schoolapp.feature.dashboard.parent.ParentHome
import com.schoolapp.feature.dashboard.supervisor.PendingTile
import com.schoolapp.feature.dashboard.teacher.TeacherDay

sealed interface DashboardUiState {
    data object Loading : DashboardUiState

    /** Principal, coordinator, head teacher (Today queue + summary) and super admin (summary only). */
    @Immutable
    data class Supervisor(
        val userName: String,
        val scopeName: String?,
        val date: String,
        val showsToday: Boolean,
        val tiles: List<PendingTile> = emptyList(),
        val pendingError: AppError? = null,
        val metrics: List<DashboardMetric> = emptyList(),
        val summaryError: AppError? = null,
        val isRefreshing: Boolean = false,
    ) : DashboardUiState

    /** Teacher and helper "Today". */
    @Immutable
    data class Teacher(
        val userName: String,
        val branchName: String?,
        val day: TeacherDay,
        val isRefreshing: Boolean = false,
    ) : DashboardUiState

    /** Parent "Home" for the child picked in the top-bar switcher; [child] null = no linked child. */
    @Immutable
    data class Parent(
        val child: ChildSummary?,
        val home: ParentHome? = null,
        val isLoading: Boolean = false,
        val error: AppError? = null,
        val isRefreshing: Boolean = false,
    ) : DashboardUiState

    /** Roles without a dashboard (accountant, custom roles, ...) see who/where they are signed in as. */
    @Immutable
    data class Welcome(
        val userName: String,
        val role: RoleRef,
        val roleName: String?,
        val branchName: String?,
        val schoolName: String?,
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
