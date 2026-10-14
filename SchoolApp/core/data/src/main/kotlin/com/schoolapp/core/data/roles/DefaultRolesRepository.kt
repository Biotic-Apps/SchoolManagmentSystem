package com.schoolapp.core.data.roles

import com.schoolapp.core.common.result.AppResult
import com.schoolapp.core.model.roles.PermissionInfo
import com.schoolapp.core.model.roles.Role
import com.schoolapp.core.model.roles.RoleInput
import com.schoolapp.core.model.roles.SchoolOption
import com.schoolapp.core.network.ApiCaller
import com.schoolapp.core.network.roles.RoleBodyDto
import com.schoolapp.core.network.roles.RoleDto
import com.schoolapp.core.network.roles.RolesApi
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.update
import javax.inject.Inject
import javax.inject.Singleton

@Singleton
class DefaultRolesRepository @Inject constructor(
    private val api: RolesApi,
    private val apiCaller: ApiCaller,
) : RolesRepository {

    private val _changes = MutableStateFlow(0)
    override val changes: StateFlow<Int> = _changes.asStateFlow()

    @Volatile
    private var catalogue: List<PermissionInfo>? = null

    override suspend fun roles(): AppResult<List<Role>> =
        apiCaller.call { api.roles().data.map { it.toModel() } }

    override suspend fun permissions(): AppResult<List<PermissionInfo>> {
        catalogue?.let { return AppResult.Success(it) }
        val result = apiCaller.call {
            api.permissions().data.map { PermissionInfo(it.key, it.module, it.action, it.description) }
        }
        if (result is AppResult.Success) catalogue = result.data
        return result
    }

    override suspend fun save(id: String?, input: RoleInput): AppResult<Role> {
        val body = RoleBodyDto(input.name?.trim(), input.schoolId?.takeIf { it.isNotBlank() }, input.permissions)
        val result = apiCaller.call { (if (id == null) api.create(body) else api.update(id, body)).data.toModel() }
        if (result is AppResult.Success) _changes.update { it + 1 }
        return result
    }

    override suspend fun delete(id: String): AppResult<Unit> {
        val result = apiCaller.call { api.delete(id) }
        if (result is AppResult.Success) _changes.update { it + 1 }
        return result
    }

    override suspend fun schoolOptions(): AppResult<List<SchoolOption>> =
        apiCaller.call { api.schools().data.map { SchoolOption(it.id, it.name) }.sortedBy { it.name.lowercase() } }

    private fun RoleDto.toModel() = Role(id, key, name, isSystem, schoolId, permissions, assignmentCount)
}
