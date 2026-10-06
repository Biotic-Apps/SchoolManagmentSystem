package com.schoolapp.feature.organisation.branches

import androidx.compose.runtime.Immutable
import com.schoolapp.core.common.result.AppError
import com.schoolapp.core.model.organisation.BranchOverview

@Immutable
data class BranchDetailUiState(
    val isLoading: Boolean = true,
    val isRefreshing: Boolean = false,
    val overview: BranchOverview? = null,
    val error: AppError? = null,
)
