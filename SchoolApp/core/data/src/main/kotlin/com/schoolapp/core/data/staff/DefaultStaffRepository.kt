package com.schoolapp.core.data.staff

import com.schoolapp.core.common.result.AppResult
import com.schoolapp.core.model.staff.StaffDetail
import com.schoolapp.core.model.staff.StaffSummary
import com.schoolapp.core.model.staff.StaffWorkload
import com.schoolapp.core.network.ApiCaller
import com.schoolapp.core.network.api.StaffApi
import javax.inject.Inject
import javax.inject.Singleton

@Singleton
class DefaultStaffRepository @Inject constructor(
    private val api: StaffApi,
    private val apiCaller: ApiCaller,
) : StaffRepository {

    override suspend fun staff(search: String?): AppResult<List<StaffSummary>> = apiCaller.call {
        api.staff(search = search?.trim()?.takeIf { it.isNotEmpty() }).data.map { it.toModel() }.sortedBy { it.name }
    }

    override suspend fun staffMember(id: String): AppResult<StaffDetail> =
        apiCaller.call { api.staffMember(id).data.toModel() }

    override suspend fun workload(id: String): AppResult<StaffWorkload> =
        apiCaller.call { api.workload(id).data.toModel() }
}
