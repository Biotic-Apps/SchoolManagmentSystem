package com.schoolapp.feature.admin.users.assignments

import androidx.compose.runtime.Immutable
import com.schoolapp.core.common.result.AppResult
import com.schoolapp.core.data.organisation.OrganisationRepository
import com.schoolapp.core.data.schools.SchoolsRepository
import com.schoolapp.core.data.users.UsersRepository
import com.schoolapp.core.model.RoleKey
import com.schoolapp.core.model.users.AssignableRole
import com.schoolapp.feature.admin.users.UserPermissions
import kotlinx.coroutines.async
import kotlinx.coroutines.coroutineScope
import javax.inject.Inject

data class NamedOption(val id: String, val name: String)

/** Roles, schools and branches the active role may hand out (web use-assignment-options.ts). */
@Immutable
data class AssignmentOptions(
    val systemRoles: List<RoleKey> = emptyList(),
    val customRoles: List<AssignableRole> = emptyList(),
    val schools: List<NamedOption> = emptyList(),
    val branches: List<NamedOption> = emptyList(),
    val isSuperAdmin: Boolean = false,
) {
    fun customName(key: String): String? = customRoles.firstOrNull { it.key == key }?.name

    /** SUPER_ADMIN only globally; a super admin may scope to a branch or a whole school; others to a branch. */
    fun scopesFor(roleKey: String): List<String> = when {
        roleKey == RoleKey.SUPER_ADMIN.key -> listOf(SCOPE_GLOBAL)
        isSuperAdmin -> listOf(SCOPE_BRANCH, SCOPE_SCHOOL)
        else -> listOf(SCOPE_BRANCH)
    }

    companion object {
        const val SCOPE_GLOBAL = "GLOBAL"
        const val SCOPE_SCHOOL = "SCHOOL"
        const val SCOPE_BRANCH = "BRANCH"
    }
}

/** Loads [AssignmentOptions]; a failing optional source (custom roles, schools) only leaves its list empty. */
class AssignmentOptionsLoader @Inject constructor(
    private val organisation: OrganisationRepository,
    private val schools: SchoolsRepository,
    private val users: UsersRepository,
) {
    suspend fun load(permissions: UserPermissions): AppResult<AssignmentOptions> = coroutineScope {
        val branchesCall = async { organisation.branches() }
        val schoolsCall = async { if (permissions.canViewSchools) schools.schools(null, ACTIVE, page = 1, pageSize = MAX_PAGE) else null }
        val rolesCall = async { if (permissions.canViewRoles) users.customRoles() else null }
        val branches = when (val result = branchesCall.await()) {
            is AppResult.Failure -> return@coroutineScope result
            is AppResult.Success -> result.data.filter { it.status == null || it.status == ACTIVE }
        }
        val multiSchool = branches.mapNotNull { it.schoolId }.distinct().size > 1
        val branchOptions = branches.map { branch ->
            val name = if (multiSchool && branch.schoolName != null) "${branch.schoolName} › ${branch.name}" else branch.name
            NamedOption(branch.id, name)
        }
        val schoolOptions = (schoolsCall.await() as? AppResult.Success)?.data?.items?.map { NamedOption(it.id, it.name) }
            ?.takeIf { it.isNotEmpty() }
            ?: branches.filter { it.schoolId != null }.distinctBy { it.schoolId }.map { NamedOption(it.schoolId!!, it.schoolName ?: it.schoolId!!) }
        val custom = (rolesCall.await() as? AppResult.Success)?.data.orEmpty()
        AppResult.Success(
            AssignmentOptions(
                systemRoles = assignableSystemRoles(permissions.isSuperAdmin),
                customRoles = custom,
                schools = schoolOptions,
                branches = branchOptions,
                isSuperAdmin = permissions.isSuperAdmin,
            ),
        )
    }

    /** Parents are linked through admissions; only a super admin grants SUPER_ADMIN / PRINCIPAL. */
    private fun assignableSystemRoles(superAdmin: Boolean): List<RoleKey> = RoleKey.entries
        .filter { it != RoleKey.PARENT }
        .filter { superAdmin || (it != RoleKey.SUPER_ADMIN && it != RoleKey.PRINCIPAL) }

    private companion object {
        const val ACTIVE = "ACTIVE"
        const val MAX_PAGE = 100
    }
}
