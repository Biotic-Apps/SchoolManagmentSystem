package com.schoolapp.feature.dashboard

import androidx.compose.runtime.Immutable
import com.schoolapp.core.common.result.AppError
import com.schoolapp.core.model.ChildSummary
import com.schoolapp.core.model.RoleRef
import com.schoolapp.core.model.dashboard.DashboardMetric
import com.schoolapp.feature.dashboard.finance.FinanceCardState
import com.schoolapp.feature.dashboard.parent.ParentHome
import com.schoolapp.feature.dashboard.setup.SetupCardState
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
        /** "Finance this month" for roles with `fees.view`; null hides the card. */
        val finance: FinanceCardState? = null,
        /** Principal's "Set up your school" card; null hides it (complete, failed or another role). */
        val setup: SetupCardState? = null,
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

    /** Roles without a supervisor dashboard (accountant, custom roles, ...): who/where they are signed in as, plus finance for `fees.view`. */
    @Immutable
    data class Welcome(
        val userName: String,
        val role: RoleRef,
        val roleName: String?,
        val branchName: String?,
        val schoolName: String?,
        val finance: FinanceCardState? = null,
        val isRefreshing: Boolean = false,
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
    /** First period still to start after now (and after the running one). */
    val isNext: Boolean = false,
    /** Already over at load time; the card hides these. */
    val isPast: Boolean = false,
)
