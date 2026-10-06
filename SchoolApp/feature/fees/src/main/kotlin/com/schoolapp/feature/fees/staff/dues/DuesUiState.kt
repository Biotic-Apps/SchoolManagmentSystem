package com.schoolapp.feature.fees.staff.dues

import androidx.compose.runtime.Immutable
import com.schoolapp.core.common.result.AppError
import com.schoolapp.core.model.fees.DuesRow

@Immutable
data class DuesUiState(
    val isLoading: Boolean = true,
    val isRefreshing: Boolean = false,
    val error: AppError? = null,
    val search: String = "",
    val rows: List<DuesRow> = emptyList(),
) {
    val totalMinor: Long get() = rows.sumOf { it.balanceMinor }
}
