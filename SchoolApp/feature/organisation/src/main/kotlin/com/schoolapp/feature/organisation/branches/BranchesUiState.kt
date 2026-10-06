package com.schoolapp.feature.organisation.branches

import androidx.compose.runtime.Immutable
import com.schoolapp.core.common.result.AppError
import com.schoolapp.core.model.organisation.Branch
import com.schoolapp.core.model.organisation.BranchOverview

@Immutable
data class BranchesUiState(
    val isLoading: Boolean = true,
    val isRefreshing: Boolean = false,
    val branches: List<Branch> = emptyList(),
    /** Set when the user has exactly one branch, so it is shown directly. */
    val overview: BranchOverview? = null,
    val error: AppError? = null,
) {
    val hasContent: Boolean get() = branches.isNotEmpty() || overview != null
}
