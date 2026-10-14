package com.schoolapp.core.data.users

import com.schoolapp.core.common.result.AppResult
import com.schoolapp.core.model.users.AdminUserDetail
import com.schoolapp.core.model.users.AdminUserPage
import com.schoolapp.core.model.users.AssignableRole
import com.schoolapp.core.model.users.AssignmentRequest
import com.schoolapp.core.model.users.CreatedUser
import com.schoolapp.core.model.users.NewUser
import com.schoolapp.core.model.users.UserContactUpdate
import kotlinx.coroutines.flow.StateFlow

/** Principals & admin users: accounts, their role assignments and sign-in controls. */
interface UsersRepository {
    /** Bumped after every successful change so open lists and details reload. */
    val changes: StateFlow<Int>

    suspend fun users(filter: UserFilter, page: Int, pageSize: Int = PAGE_SIZE): AppResult<AdminUserPage>
    suspend fun user(id: String): AppResult<AdminUserDetail>
    suspend fun create(user: NewUser): AppResult<CreatedUser>
    suspend fun update(id: String, update: UserContactUpdate): AppResult<AdminUserDetail>
    suspend fun disable(id: String): AppResult<AdminUserDetail>
    suspend fun enable(id: String): AppResult<AdminUserDetail>
    suspend fun unlock(id: String): AppResult<AdminUserDetail>

    /** Returns the new temporary password (shown once). */
    suspend fun resetPassword(id: String): AppResult<String>
    suspend fun addAssignment(userId: String, request: AssignmentRequest): AppResult<AdminUserDetail>
    suspend fun endAssignment(userId: String, assignmentId: String): AppResult<AdminUserDetail>

    /** Custom (non-system) roles the admin may hand out; needs `roles.view`. */
    suspend fun customRoles(): AppResult<List<AssignableRole>>

    companion object {
        const val PAGE_SIZE = 25
    }
}

/** List filters; null means "all". */
data class UserFilter(
    val search: String? = null,
    val role: String? = null,
    val branchId: String? = null,
    val status: String? = null,
)
