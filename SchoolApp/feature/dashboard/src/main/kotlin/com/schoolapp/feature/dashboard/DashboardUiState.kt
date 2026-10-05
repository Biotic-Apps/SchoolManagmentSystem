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
    ) : DashboardUiState

    data class Error(val error: AppError) : DashboardUiState
}
