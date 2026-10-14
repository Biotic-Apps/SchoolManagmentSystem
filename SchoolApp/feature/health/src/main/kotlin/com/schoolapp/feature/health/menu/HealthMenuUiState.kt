package com.schoolapp.feature.health.menu

import androidx.compose.runtime.Immutable
import com.schoolapp.core.common.result.AppError
import com.schoolapp.core.model.health.Incident
import com.schoolapp.feature.health.components.StudentSearchState

enum class HealthTab { INCIDENTS, ALERTS, STUDENTS }

@Immutable
data class HealthMenuUiState(
    val tab: HealthTab = HealthTab.INCIDENTS,
    val isLoading: Boolean = true,
    val isRefreshing: Boolean = false,
    val isLoadingMore: Boolean = false,
    val incidents: List<Incident> = emptyList(),
    /** `YYYY-MM-DD` range of the incidents list (defaults to the last 30 days). */
    val from: String = "",
    val to: String = "",
    val today: String = "",
    val page: Int = 1,
    val hasMore: Boolean = false,
    val error: AppError? = null,
    val moreError: AppError? = null,
    val canClose: Boolean = false,
    val confirmClose: Incident? = null,
    val closingId: String? = null,
    val actionError: AppError? = null,
    val search: StudentSearchState = StudentSearchState(),
)
