package com.schoolapp.core.data.staff

import com.schoolapp.core.common.result.AppResult
import com.schoolapp.core.model.staff.CreatedStaff
import com.schoolapp.core.model.staff.NewStaffInput
import com.schoolapp.core.model.staff.StaffDetail
import com.schoolapp.core.model.staff.StaffLogin
import com.schoolapp.core.model.staff.StaffProfileInput
import com.schoolapp.core.model.staff.StaffStatusChange
import com.schoolapp.core.network.ApiCaller
import com.schoolapp.core.network.api.StaffApi
import com.schoolapp.core.network.dto.staff.CreateStaffAccountRequest
import javax.inject.Inject
import javax.inject.Singleton

@Singleton
class DefaultStaffAdminRepository @Inject constructor(
    private val api: StaffApi,
    private val apiCaller: ApiCaller,
) : StaffAdminRepository {

    override suspend fun create(input: NewStaffInput): AppResult<CreatedStaff> =
        apiCaller.call { api.create(input.toRequest()).data.toModel() }

    override suspend fun update(id: String, input: StaffProfileInput): AppResult<StaffDetail> =
        apiCaller.call { api.update(id, input.toUpdateRequest()).data.toModel() }

    override suspend fun setStatus(id: String, change: StaffStatusChange): AppResult<StaffDetail> =
        apiCaller.call { api.setStatus(id, change.toRequest()).data.toModel() }

    override suspend fun createAccount(id: String, email: String?, phone: String?, roleKey: String?): AppResult<StaffLogin> =
        apiCaller.call {
            val body = CreateStaffAccountRequest(email?.trim()?.ifEmpty { null }, phone?.trim()?.ifEmpty { null }, roleKey)
            api.createAccount(id, body).data.let { StaffLogin(it.userId, it.email, it.phone, it.temporaryPassword?.ifBlank { null }) }
        }

    override suspend fun resetPassword(id: String): AppResult<StaffLogin> =
        apiCaller.call { api.resetPassword(id).data.let { StaffLogin(it.userId, null, null, it.temporaryPassword) } }
}
