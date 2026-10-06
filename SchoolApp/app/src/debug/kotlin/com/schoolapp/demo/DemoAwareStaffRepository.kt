package com.schoolapp.demo

import com.schoolapp.core.common.result.AppError
import com.schoolapp.core.common.result.AppResult
import com.schoolapp.core.data.staff.DefaultStaffRepository
import com.schoolapp.core.data.staff.StaffRepository
import com.schoolapp.core.model.staff.StaffDetail
import com.schoolapp.core.model.staff.StaffSummary
import com.schoolapp.core.model.staff.StaffWorkload
import javax.inject.Inject
import javax.inject.Singleton

@Singleton
class DemoAwareStaffRepository @Inject constructor(
    private val real: DefaultStaffRepository,
    private val auth: DemoAwareAuthRepository,
) : StaffRepository {

    override suspend fun staff(search: String?): AppResult<List<StaffSummary>> {
        if (!auth.isDemoActive) return real.staff(search)
        val q = search?.trim().orEmpty()
        return AppResult.Success(DemoStaffData.staff.filter { q.isEmpty() || it.name.contains(q, true) })
    }

    override suspend fun staffMember(id: String): AppResult<StaffDetail> {
        if (!auth.isDemoActive) return real.staffMember(id)
        return DemoStaffData.detail(id)?.let { AppResult.Success(it) } ?: AppResult.Failure(AppError.Server(404, "NOT_FOUND", null))
    }

    override suspend fun workload(id: String): AppResult<StaffWorkload> =
        if (auth.isDemoActive) AppResult.Success(DemoStaffData.workload(id)) else real.workload(id)
}
