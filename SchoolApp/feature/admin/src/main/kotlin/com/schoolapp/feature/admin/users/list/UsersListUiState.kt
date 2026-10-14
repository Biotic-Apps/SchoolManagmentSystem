package com.schoolapp.feature.admin.users.list

import androidx.compose.runtime.Immutable
import com.schoolapp.core.common.result.AppError
import com.schoolapp.core.data.users.UserFilter
import com.schoolapp.core.model.users.AdminUser
import com.schoolapp.feature.admin.users.UserPermissions
import com.schoolapp.feature.admin.users.assignments.NamedOption

@Immutable
data class UsersListUiState(
    val isLoading: Boolean = true,
    val isRefreshing: Boolean = false,
    val isLoadingMore: Boolean = false,
    val query: String = "",
    val role: String? = null,
    val branchId: String? = null,
    val status: String? = null,
    val users: List<AdminUser> = emptyList(),
    val page: Int = 1,
    val hasMore: Boolean = false,
    val error: AppError? = null,
    val moreError: AppError? = null,
    val branches: List<NamedOption> = emptyList(),
    val permissions: UserPermissions = UserPermissions(),
) {
    val canAdd: Boolean get() = permissions.canAdd
    val isFiltered: Boolean get() = query.isNotBlank() || role != null || branchId != null || status != null
    val filter: UserFilter get() = UserFilter(query, role, branchId, status)
}
