package com.schoolapp.feature.health.menu

import androidx.compose.runtime.Immutable
import com.schoolapp.core.common.result.AppError
import com.schoolapp.core.model.health.Incident
import com.schoolapp.feature.health.components.StudentSearchState

enum class HealthTab { INCIDENTS, STUDENTS }

@Immutable
data class HealthMenuUiState(
    val tab: HealthTab = HealthTab.INCIDENTS,
    val isLoading: Boolean = true,
    val isRefreshing: Boolean = false,
    val incidents: List<Incident> = emptyList(),
    val error: AppError? = null,
    val canClose: Boolean = false,
    val confirmClose: Incident? = null,
    val closingId: String? = null,
    val actionError: AppError? = null,
    val search: StudentSearchState = StudentSearchState(),
)
