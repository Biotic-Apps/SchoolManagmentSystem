package com.schoolapp.feature.admin.users.detail

import androidx.compose.runtime.Immutable
import com.schoolapp.core.common.result.AppError
import com.schoolapp.core.model.users.AdminUserDetail
import com.schoolapp.core.model.users.UserAssignment
import com.schoolapp.feature.admin.users.UserPermissions
import com.schoolapp.feature.admin.users.components.isActive
import com.schoolapp.feature.admin.users.components.isLocked

/** A confirm dialog of the detail screen. */
sealed interface UserConfirm {
    data object ToggleStatus : UserConfirm
    data object ResetPassword : UserConfirm
    data object Unlock : UserConfirm
    data class EndAssignment(val assignment: UserAssignment) : UserConfirm
}

@Immutable
data class UserDetailUiState(
    val isLoading: Boolean = true,
    val isRefreshing: Boolean = false,
    val detail: AdminUserDetail? = null,
    val error: AppError? = null,
    val permissions: UserPermissions = UserPermissions(),
    val confirm: UserConfirm? = null,
    val isWorking: Boolean = false,
    val actionError: AppError? = null,
    /** New temporary password after a reset; shown once. */
    val revealedPassword: String? = null,
) {
    private val isSelf: Boolean get() = detail?.let { permissions.isSelf(it.user.id) } == true

    val canEdit: Boolean get() = permissions.canEdit

    /** Reset, unlock, disable and role changes are never offered on your own account. */
    val canManage: Boolean get() = permissions.canEdit && !isSelf

    val canUnlock: Boolean get() = canManage && detail?.user?.isLocked() == true

    val activeAssignments: List<UserAssignment> get() = detail?.assignments.orEmpty().filter { it.isActive() }
}
