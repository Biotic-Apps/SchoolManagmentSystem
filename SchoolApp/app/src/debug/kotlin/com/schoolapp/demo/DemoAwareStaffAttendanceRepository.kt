package com.schoolapp.demo

import com.schoolapp.core.common.result.AppResult
import com.schoolapp.core.data.attendance.DefaultStaffAttendanceRepository
import com.schoolapp.core.data.attendance.StaffAttendanceRepository
import com.schoolapp.core.model.attendance.StaffAttendanceSheet
import com.schoolapp.core.model.attendance.StaffMark
import javax.inject.Inject
import javax.inject.Singleton

@Singleton
class DemoAwareStaffAttendanceRepository @Inject constructor(
    private val real: DefaultStaffAttendanceRepository,
    private val auth: DemoAwareAuthRepository,
) : StaffAttendanceRepository {

    override suspend fun sheet(branchId: String, date: String): AppResult<StaffAttendanceSheet> =
        if (auth.isDemoActive) AppResult.Success(DemoStaffSheetData.sheet(branchId, date)) else real.sheet(branchId, date)

    override suspend fun save(branchId: String, date: String, marks: List<StaffMark>): AppResult<StaffAttendanceSheet> =
        if (auth.isDemoActive) AppResult.Success(DemoStaffSheetData.save(branchId, date, marks)) else real.save(branchId, date, marks)
}
