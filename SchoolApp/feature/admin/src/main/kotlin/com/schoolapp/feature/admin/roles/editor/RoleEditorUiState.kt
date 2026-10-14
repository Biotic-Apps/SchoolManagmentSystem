package com.schoolapp.feature.admin.roles.editor

import androidx.annotation.StringRes
import androidx.compose.runtime.Immutable
import com.schoolapp.core.common.result.AppError
import com.schoolapp.core.model.roles.Role
import com.schoolapp.core.model.roles.SchoolOption
import com.schoolapp.feature.admin.roles.MatrixRow
import com.schoolapp.feature.admin.roles.PermissionMatrix
import com.schoolapp.feature.admin.roles.RoleEditRights

@Immutable
data class RoleEditorUiState(
    val isNew: Boolean = true,
    val isLoading: Boolean = true,
    val loadError: AppError? = null,
    val role: Role? = null,
    val matrix: PermissionMatrix = PermissionMatrix(emptyList(), emptyList()),
    val total: Int = 0,
    val name: String = "",
    @StringRes val nameError: Int? = null,
    /** Server message for the name (e.g. "Role CUSTOM_X already exists"). */
    val nameServerError: String? = null,
    val showSchool: Boolean = false,
    val allowGlobal: Boolean = true,
    val schools: List<SchoolOption> = emptyList(),
    val schoolId: String = "",
    val selected: List<String> = emptyList(),
    val permissionsError: Boolean = false,
    val rights: RoleEditRights = RoleEditRights(name = true, permissions = true),
    @StringRes val notice: Int? = null,
    val moduleQuery: String = "",
    val isDirty: Boolean = false,
    val isSaving: Boolean = false,
    val saveError: AppError? = null,
    val done: Boolean = false,
) {
    val selectedSet: Set<String> = selected.toSet()

    val visibleRows: List<MatrixRow>
        get() {
            val term = moduleQuery.trim().lowercase()
            return if (term.isEmpty()) matrix.rows else matrix.rows.filter { term in it.label.lowercase() || term in it.module.lowercase() }
        }
}
