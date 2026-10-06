package com.schoolapp.feature.health.card

import androidx.compose.runtime.Immutable
import com.schoolapp.core.common.result.AppError
import com.schoolapp.core.model.health.HealthProfile
import com.schoolapp.core.model.health.Incident

/** [profile] has emergency contacts already sorted by priority. */
@Immutable
data class HealthCardUiState(
    val isLoading: Boolean = true,
    val studentId: String? = null,
    val studentName: String? = null,
    val profile: HealthProfile? = null,
    val error: AppError? = null,
    val noChild: Boolean = false,
    val notFound: Boolean = false,
    val isParent: Boolean = false,
    val canReport: Boolean = false,
    val incidents: List<Incident> = emptyList(),
    val editor: ChangeRequestEditor? = null,
    val requestSent: Boolean = false,
)
