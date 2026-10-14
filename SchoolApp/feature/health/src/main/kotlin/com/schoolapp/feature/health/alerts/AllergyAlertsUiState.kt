package com.schoolapp.feature.health.alerts

import androidx.compose.runtime.Immutable
import com.schoolapp.core.common.result.AppError
import com.schoolapp.core.model.health.HealthAlert
import com.schoolapp.core.model.organisation.Branch
import com.schoolapp.core.model.organisation.Section

@Immutable
data class AllergyAlertsUiState(
    val isLoading: Boolean = true,
    val isRefreshing: Boolean = false,
    /** Only filled when the user can pick between several branches. */
    val branches: List<Branch> = emptyList(),
    val branchId: String? = null,
    val sections: List<Section> = emptyList(),
    val sectionId: String? = null,
    val alerts: List<HealthAlert> = emptyList(),
    val isAlertsLoading: Boolean = false,
    val error: AppError? = null,
)
