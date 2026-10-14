package com.schoolapp.feature.admin.schools.detail

import androidx.compose.runtime.Immutable
import com.schoolapp.core.common.result.AppError
import com.schoolapp.core.model.schools.School
import com.schoolapp.feature.admin.schools.SchoolPermissions

@Immutable
data class SchoolDetailUiState(
    val isLoading: Boolean = true,
    val isRefreshing: Boolean = false,
    val school: School? = null,
    val error: AppError? = null,
    val permissions: SchoolPermissions = SchoolPermissions(),
    /** Archive / restore confirm dialog is open. */
    val confirmingStatus: Boolean = false,
    val isChangingStatus: Boolean = false,
    val actionError: AppError? = null,
) {
    val canEdit: Boolean get() = permissions.canEdit
    val canDelete: Boolean get() = permissions.canDelete

    /** Archive needs `schools.delete`; restore needs `schools.edit` (web school-columns.tsx). */
    val canToggleStatus: Boolean
        get() = school?.let { if (it.isActive) permissions.canArchive else permissions.canEdit } == true
}
