package com.schoolapp.feature.admin.schools.list

import androidx.compose.runtime.Immutable
import com.schoolapp.core.common.result.AppError
import com.schoolapp.core.model.schools.School
import com.schoolapp.feature.admin.schools.SchoolPermissions

@Immutable
data class SchoolsListUiState(
    val isLoading: Boolean = true,
    val isRefreshing: Boolean = false,
    val isLoadingMore: Boolean = false,
    val query: String = "",
    /** null = all, else ACTIVE / ARCHIVED. */
    val status: String? = null,
    val schools: List<School> = emptyList(),
    val page: Int = 1,
    val hasMore: Boolean = false,
    val error: AppError? = null,
    val moreError: AppError? = null,
    val permissions: SchoolPermissions = SchoolPermissions(),
) {
    val canSetup: Boolean get() = permissions.canSetup
    val isFiltered: Boolean get() = query.isNotBlank() || status != null
}
