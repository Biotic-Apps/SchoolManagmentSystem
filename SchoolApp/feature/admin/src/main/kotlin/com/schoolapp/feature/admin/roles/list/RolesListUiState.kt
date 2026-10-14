package com.schoolapp.feature.admin.roles.list

import androidx.annotation.StringRes
import androidx.compose.runtime.Immutable
import com.schoolapp.core.common.result.AppError
import com.schoolapp.core.model.roles.Role

@Immutable
data class RolesListUiState(
    val isLoading: Boolean = true,
    val isRefreshing: Boolean = false,
    val roles: List<Role> = emptyList(),
    val query: String = "",
    val error: AppError? = null,
    val canAdd: Boolean = false,
    val canDelete: Boolean = false,
    /** Role ids whose open action edits (rather than only views) the permissions. */
    val editableIds: Set<String> = emptySet(),
    val deleteTarget: Role? = null,
    val isDeleting: Boolean = false,
    val actionError: AppError? = null,
    @StringRes val message: Int? = null,
) {
    val visibleRoles: List<Role>
        get() {
            val term = query.trim().lowercase()
            return if (term.isEmpty()) roles else roles.filter { term in it.name.lowercase() || term in it.key.lowercase() }
        }
}
