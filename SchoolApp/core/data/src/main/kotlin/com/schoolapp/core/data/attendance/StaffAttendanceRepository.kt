package com.schoolapp.core.data.attendance

import com.schoolapp.core.common.result.AppResult
import com.schoolapp.core.model.attendance.StaffAttendanceSheet
import com.schoolapp.core.model.attendance.StaffMark

/** Branch staff register marked by the office / principal (online only, like web). */
interface StaffAttendanceRepository {
    /** `GET /staff-attendance`: every active staff member of the branch with the day's marks. */
    suspend fun sheet(branchId: String, date: String): AppResult<StaffAttendanceSheet>

    /** `PUT /staff-attendance`: upserts [marks] and returns the refreshed day. */
    suspend fun save(branchId: String, date: String, marks: List<StaffMark>): AppResult<StaffAttendanceSheet>
}
