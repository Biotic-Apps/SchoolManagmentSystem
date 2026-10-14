package com.schoolapp.core.data.roles

import com.schoolapp.core.common.result.AppResult
import com.schoolapp.core.model.roles.PermissionInfo
import com.schoolapp.core.model.roles.Role
import com.schoolapp.core.model.roles.RoleInput
import com.schoolapp.core.model.roles.SchoolOption
import kotlinx.coroutines.flow.StateFlow

interface RolesRepository {
    /** Bumped after every create/update/delete so open screens reload. */
    val changes: StateFlow<Int>

    suspend fun roles(): AppResult<List<Role>>

    /** The catalogue never changes at runtime, so it is cached after the first load. */
    suspend fun permissions(): AppResult<List<PermissionInfo>>

    suspend fun save(id: String?, input: RoleInput): AppResult<Role>
    suspend fun delete(id: String): AppResult<Unit>
    suspend fun schoolOptions(): AppResult<List<SchoolOption>>
}
