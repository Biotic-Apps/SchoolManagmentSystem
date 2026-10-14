package com.schoolapp.feature.admin.roles.editor

import androidx.annotation.StringRes
import com.schoolapp.core.common.result.AppError
import com.schoolapp.core.common.result.AppResult
import com.schoolapp.core.data.roles.RolesRepository
import com.schoolapp.core.model.RoleKey
import com.schoolapp.core.model.SessionContext
import com.schoolapp.core.model.roles.SchoolOption
import com.schoolapp.feature.admin.R
import com.schoolapp.feature.admin.roles.ROLE_NAME_MAX
import com.schoolapp.feature.admin.roles.ROLE_NAME_MIN
import com.schoolapp.feature.admin.roles.RolePermissions
import com.schoolapp.feature.admin.roles.buildPermissionMatrix
import com.schoolapp.feature.admin.roles.roleEditRights
import com.schoolapp.feature.admin.roles.roleReadOnlyNotice
import kotlinx.coroutines.async
import kotlinx.coroutines.coroutineScope

/** Loads the catalogue, the role being edited and (for a new role) the school options in parallel. */
internal class RoleEditorLoader(private val repository: RolesRepository) {

    suspend fun load(roleId: String?, session: SessionContext?, current: RoleEditorUiState): RoleEditorUiState = coroutineScope {
        val showSchool = roleId == null && session?.has(RolePermissions.SCHOOLS_VIEW) == true
        val catalogue = async { repository.permissions() }
        val roles = async { if (roleId != null) repository.roles() else null }
        val schools = async { if (showSchool) repository.schoolOptions() else null }

        val permissions = when (val result = catalogue.await()) {
            is AppResult.Success -> result.data
            is AppResult.Failure -> return@coroutineScope current.copy(isLoading = false, loadError = result.error)
        }
        val role = when (val result = roles.await()) {
            null -> null
            is AppResult.Success -> result.data.firstOrNull { it.id == roleId }
                ?: return@coroutineScope current.copy(isLoading = false, loadError = AppError.Server(NOT_FOUND, null, null))
            is AppResult.Failure -> return@coroutineScope current.copy(isLoading = false, loadError = result.error)
        }
        val schoolOptions = (schools.await() as? AppResult.Success<List<SchoolOption>>)?.data.orEmpty()
        val superAdmin = session?.activeRole == RoleKey.SUPER_ADMIN
        val rights = roleEditRights(role, session)
        val keep = !current.isLoading || current.isDirty
        current.copy(
            isLoading = false,
            loadError = null,
            role = role,
            matrix = buildPermissionMatrix(permissions),
            total = permissions.size,
            rights = rights,
            notice = roleReadOnlyNotice(role, rights, session),
            showSchool = showSchool && schoolOptions.isNotEmpty(),
            allowGlobal = superAdmin,
            schools = schoolOptions,
            name = if (keep) current.name else role?.name.orEmpty(),
            selected = if (keep) current.selected else role?.permissions.orEmpty(),
            schoolId = if (keep) current.schoolId else defaultSchool(superAdmin, session, schoolOptions),
        )
    }

    /** Only a Super Admin may create a global role; anyone else starts on their own school. */
    private fun defaultSchool(superAdmin: Boolean, session: SessionContext?, options: List<SchoolOption>): String = when {
        superAdmin -> ""
        else -> session?.activeAssignments?.firstNotNullOfOrNull { it.schoolId } ?: options.singleOrNull()?.id.orEmpty()
    }

    private companion object {
        const val NOT_FOUND = 404
    }
}

@StringRes
internal fun validateRoleName(name: String): Int? {
    val trimmed = name.trim()
    return when {
        trimmed.isEmpty() -> R.string.roles_name_required
        trimmed.length < ROLE_NAME_MIN -> R.string.roles_name_too_short
        trimmed.length > ROLE_NAME_MAX -> R.string.roles_name_too_long
        else -> null
    }
}
