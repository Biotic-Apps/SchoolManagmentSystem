package com.schoolapp.feature.attendance

import com.schoolapp.core.common.result.AppError
import com.schoolapp.core.common.result.AppResult
import com.schoolapp.core.data.attendance.StaffAttendanceRepository
import com.schoolapp.core.data.organisation.OrganisationRepository
import com.schoolapp.core.model.attendance.AttendanceStatus
import com.schoolapp.core.model.attendance.StaffAttendanceSheet
import com.schoolapp.core.model.attendance.StaffMark
import com.schoolapp.core.model.attendance.StaffRosterEntry
import com.schoolapp.core.model.organisation.AcademicSession
import com.schoolapp.core.model.organisation.Branch
import com.schoolapp.core.model.organisation.BranchOverview
import com.schoolapp.core.model.organisation.CalendarEvent
import com.schoolapp.core.model.organisation.SchoolClass
import com.schoolapp.core.model.organisation.Section
import com.schoolapp.core.model.organisation.Subject

internal fun staffEntry(
    id: String,
    name: String,
    status: AttendanceStatus? = null,
    checkIn: String? = null,
    checkOut: String? = null,
    remark: String? = null,
) = StaffRosterEntry(id, name, "Teacher", null, status, checkIn, checkOut, remark)

/** Serves [entries] for any branch/date; a save applies the marks and returns the updated sheet. */
internal class FakeStaffAttendanceRepository(var entries: List<StaffRosterEntry>) : StaffAttendanceRepository {
    val sheetCalls = mutableListOf<Pair<String, String>>()
    val saveCalls = mutableListOf<Triple<String, String, List<StaffMark>>>()
    var sheetError: AppError? = null
    var saveError: AppError? = null

    override suspend fun sheet(branchId: String, date: String): AppResult<StaffAttendanceSheet> {
        sheetCalls += branchId to date
        sheetError?.let { return AppResult.Failure(it) }
        return AppResult.Success(StaffAttendanceSheet(branchId, date, entries))
    }

    override suspend fun save(branchId: String, date: String, marks: List<StaffMark>): AppResult<StaffAttendanceSheet> {
        saveCalls += Triple(branchId, date, marks)
        saveError?.let { return AppResult.Failure(it) }
        entries = entries.map { e ->
            marks.firstOrNull { it.staffId == e.staffId }
                ?.let { e.copy(status = it.status, checkIn = it.checkIn, checkOut = it.checkOut, remark = it.remark) } ?: e
        }
        return AppResult.Success(StaffAttendanceSheet(branchId, date, entries))
    }
}

internal fun branch(id: String, name: String) =
    Branch(id, "s1", "School", null, name, null, null, null, null, emptyList(), null, "ACTIVE")

/** Only [branches] is used by the staff register. */
internal class FakeBranchesRepository(var branches: AppResult<List<Branch>>) : OrganisationRepository {
    var branchCalls = 0

    override suspend fun branches(): AppResult<List<Branch>> {
        branchCalls++
        return branches
    }

    override suspend fun branchOverview(branchId: String): AppResult<BranchOverview> = unused()
    override suspend fun sessions(branchId: String): AppResult<List<AcademicSession>> = unused()
    override suspend fun calendar(branchId: String, from: String?, to: String?): AppResult<List<CalendarEvent>> = unused()
    override suspend fun classes(schoolId: String?): AppResult<List<SchoolClass>> = unused()
    override suspend fun sections(branchId: String, sessionId: String?): AppResult<List<Section>> = unused()
    override suspend fun subjects(schoolId: String?): AppResult<List<Subject>> = unused()

    private fun unused() = AppResult.Failure(AppError.Unknown())
}
