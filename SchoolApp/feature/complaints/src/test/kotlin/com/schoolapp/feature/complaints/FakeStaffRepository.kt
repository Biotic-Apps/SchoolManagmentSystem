package com.schoolapp.feature.complaints

import com.schoolapp.core.common.result.AppError
import com.schoolapp.core.common.result.AppResult
import com.schoolapp.core.data.staff.StaffRepository
import com.schoolapp.core.model.staff.StaffDetail
import com.schoolapp.core.model.staff.StaffSummary
import com.schoolapp.core.model.staff.StaffWorkload

fun staffMember(id: String, name: String, userId: String?, status: String = "ACTIVE", designation: String = "Teacher") =
    StaffSummary(id, name, null, null, designation, "Main", status, listOf("TEACHER"), false, null, 0, 0, userId)

class FakeStaffRepository(
    var staff: List<StaffSummary> = emptyList(),
    var failWith: AppError? = null,
) : StaffRepository {
    var listCalls = 0

    override suspend fun staff(search: String?): AppResult<List<StaffSummary>> {
        listCalls++
        return failWith?.let { AppResult.Failure(it) } ?: AppResult.Success(staff)
    }

    override suspend fun staffMember(id: String): AppResult<StaffDetail> = AppResult.Failure(AppError.Network)

    override suspend fun workload(id: String): AppResult<StaffWorkload> = AppResult.Failure(AppError.Network)
}
