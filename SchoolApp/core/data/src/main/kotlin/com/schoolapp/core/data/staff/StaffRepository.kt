package com.schoolapp.core.data.staff

import com.schoolapp.core.common.result.AppResult
import com.schoolapp.core.model.staff.StaffDetail
import com.schoolapp.core.model.staff.StaffSummary
import com.schoolapp.core.model.staff.StaffWorkload

/** Staff directory and profiles; writes live in StaffAdminRepository and StaffAssignmentsRepository. */
interface StaffRepository {
    suspend fun staff(search: String?): AppResult<List<StaffSummary>>
    suspend fun staffMember(id: String): AppResult<StaffDetail>
    suspend fun workload(id: String): AppResult<StaffWorkload>
}
