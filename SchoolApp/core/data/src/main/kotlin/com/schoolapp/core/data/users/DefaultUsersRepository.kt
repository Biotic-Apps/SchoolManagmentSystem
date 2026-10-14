package com.schoolapp.core.data.users

import com.schoolapp.core.common.result.AppResult
import com.schoolapp.core.common.result.onSuccess
import com.schoolapp.core.model.users.AdminUserDetail
import com.schoolapp.core.model.users.AdminUserPage
import com.schoolapp.core.model.users.AssignableRole
import com.schoolapp.core.model.users.AssignmentRequest
import com.schoolapp.core.model.users.CreatedUser
import com.schoolapp.core.model.users.NewUser
import com.schoolapp.core.model.users.UserContactUpdate
import com.schoolapp.core.network.ApiCaller
import com.schoolapp.core.network.users.UsersApi
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.update
import javax.inject.Inject
import javax.inject.Singleton

@Singleton
class DefaultUsersRepository @Inject constructor(
    private val api: UsersApi,
    private val apiCaller: ApiCaller,
) : UsersRepository {

    private val _changes = MutableStateFlow(0)
    override val changes: StateFlow<Int> = _changes.asStateFlow()

    override suspend fun users(filter: UserFilter, page: Int, pageSize: Int): AppResult<AdminUserPage> = apiCaller.call {
        val response = api.users(
            search = filter.search?.trim()?.takeIf { it.isNotEmpty() },
            role = filter.role,
            branchId = filter.branchId,
            status = filter.status,
            page = page,
            pageSize = pageSize,
        )
        AdminUserPage(response.data.map { it.toModel() }, response.meta?.total, page, pageSize)
    }

    override suspend fun user(id: String): AppResult<AdminUserDetail> = apiCaller.call { api.user(id).data.toDetail() }

    override suspend fun create(user: NewUser): AppResult<CreatedUser> = apiCaller.call {
        val created = api.create(user.toBody()).data
        CreatedUser(created.toDetail(), created.temporaryPassword?.takeIf { it.isNotBlank() })
    }.changed()

    override suspend fun update(id: String, update: UserContactUpdate): AppResult<AdminUserDetail> =
        apiCaller.call { api.update(id, update.toBody()).data.toDetail() }.changed()

    override suspend fun disable(id: String): AppResult<AdminUserDetail> = apiCaller.call { api.disable(id).data.toDetail() }.changed()

    override suspend fun enable(id: String): AppResult<AdminUserDetail> = apiCaller.call { api.enable(id).data.toDetail() }.changed()

    override suspend fun unlock(id: String): AppResult<AdminUserDetail> = apiCaller.call { api.unlock(id).data.toDetail() }.changed()

    override suspend fun resetPassword(id: String): AppResult<String> =
        apiCaller.call { api.resetPassword(id).data.temporaryPassword }.changed()

    override suspend fun addAssignment(userId: String, request: AssignmentRequest): AppResult<AdminUserDetail> =
        apiCaller.call { api.addAssignment(userId, request.toBody()).data.toDetail() }.changed()

    override suspend fun endAssignment(userId: String, assignmentId: String): AppResult<AdminUserDetail> =
        apiCaller.call { api.endAssignment(userId, assignmentId).data.toDetail() }.changed()

    override suspend fun customRoles(): AppResult<List<AssignableRole>> = apiCaller.call {
        api.roles().data.filterNot { it.isSystem }.map { AssignableRole(it.key, it.name.ifBlank { it.key }) }
    }

    private fun <T> AppResult<T>.changed(): AppResult<T> = onSuccess { _changes.update { it + 1 } }
}
