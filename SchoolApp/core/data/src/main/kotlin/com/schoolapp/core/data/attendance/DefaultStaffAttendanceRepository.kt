package com.schoolapp.core.data.attendance

import com.schoolapp.core.common.result.AppResult
import com.schoolapp.core.model.attendance.StaffAttendanceSheet
import com.schoolapp.core.model.attendance.StaffMark
import com.schoolapp.core.network.ApiCaller
import com.schoolapp.core.network.api.StaffAttendanceApi
import com.schoolapp.core.network.dto.attendance.StaffAttendanceBodyDto
import javax.inject.Inject
import javax.inject.Singleton

@Singleton
class DefaultStaffAttendanceRepository @Inject constructor(
    private val api: StaffAttendanceApi,
    private val apiCaller: ApiCaller,
) : StaffAttendanceRepository {

    override suspend fun sheet(branchId: String, date: String): AppResult<StaffAttendanceSheet> =
        apiCaller.call { api.sheet(branchId, date).data.toModel(branchId, date) }

    override suspend fun save(branchId: String, date: String, marks: List<StaffMark>): AppResult<StaffAttendanceSheet> =
        apiCaller.call {
            val body = StaffAttendanceBodyDto(branchId, date, marks.map { it.toDto() })
            api.save(body).data.toModel(branchId, date)
        }
}
