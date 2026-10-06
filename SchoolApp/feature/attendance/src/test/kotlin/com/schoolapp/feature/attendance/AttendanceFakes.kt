package com.schoolapp.feature.attendance

import com.schoolapp.core.common.result.AppError
import com.schoolapp.core.common.result.AppResult
import com.schoolapp.core.data.attendance.AttendanceRepository
import com.schoolapp.core.data.health.HealthRepository
import com.schoolapp.core.data.leave.LeaveRepository
import com.schoolapp.core.model.attendance.AttendanceRegister
import com.schoolapp.core.model.attendance.AttendanceStatus
import com.schoolapp.core.model.attendance.EntryMark
import com.schoolapp.core.model.attendance.LoadedRegister
import com.schoolapp.core.model.attendance.MyStaffAttendance
import com.schoolapp.core.model.attendance.RegisterEntry
import com.schoolapp.core.model.attendance.RegisterOutcome
import com.schoolapp.core.model.attendance.RegisterStatus
import com.schoolapp.core.model.attendance.RegisterSyncState
import com.schoolapp.core.model.attendance.SectionAttendance
import com.schoolapp.core.model.attendance.StudentAttendance
import com.schoolapp.core.model.attendance.UnmarkedSection
import com.schoolapp.core.model.common.PersonRef
import com.schoolapp.core.model.health.HealthAlert
import com.schoolapp.core.model.health.HealthChangeInput
import com.schoolapp.core.model.health.HealthProfile
import com.schoolapp.core.model.health.Incident
import com.schoolapp.core.model.health.IncidentInput
import com.schoolapp.core.model.leave.LeaveInput
import com.schoolapp.core.model.leave.LeaveKind
import com.schoolapp.core.model.leave.LeaveRequest
import com.schoolapp.core.model.leave.LeaveScope
import com.schoolapp.core.model.leave.LeaveStatus
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.MutableStateFlow

internal fun entry(id: String, name: String, roll: Int, status: AttendanceStatus? = null, onLeave: Boolean = false) =
    RegisterEntry(entryId = "e_$id", studentId = id, name = name, rollNo = roll, photoUrl = null, status = status, remark = null, onLeave = onLeave)

internal fun register(status: RegisterStatus = RegisterStatus.UNMARKED, entries: List<RegisterEntry>, submittedBy: PersonRef? = null) =
    AttendanceRegister(
        id = "r1", sectionId = "sec1", date = "2026-10-06", status = status, version = 1,
        submittedBy = submittedBy, onBehalfOf = null, lockedAt = null, entries = entries,
    )

internal class FakeAttendanceRepository(var loaded: LoadedRegister) : AttendanceRepository {
    val draftCalls = mutableListOf<Pair<List<EntryMark>, String>>()
    val submitCalls = mutableListOf<Pair<List<EntryMark>, String>>()
    val results = ArrayDeque<AppResult<RegisterOutcome>>()
    var discardCalls = 0
    val sync = MutableStateFlow(RegisterSyncState.NONE)
    var summary: List<SectionAttendance> = emptyList()
    var unmarkedSections: List<UnmarkedSection> = emptyList()

    private fun next(marks: List<EntryMark>): AppResult<RegisterOutcome> = results.removeFirstOrNull()
        ?: AppResult.Success(RegisterOutcome.Saved(loaded.register.copy(entries = loaded.register.entries.map { e -> e.copy(status = marks.firstOrNull { it.studentId == e.studentId }?.status) })))

    override suspend fun register(sectionId: String, date: String): AppResult<LoadedRegister> = AppResult.Success(loaded)

    override suspend fun saveDraft(sectionId: String, date: String, marks: List<EntryMark>, clientRequestId: String): AppResult<RegisterOutcome> {
        draftCalls += marks to clientRequestId
        return next(marks)
    }

    override suspend fun submit(sectionId: String, date: String, marks: List<EntryMark>, clientRequestId: String): AppResult<RegisterOutcome> {
        submitCalls += marks to clientRequestId
        return next(marks)
    }

    override fun syncState(sectionId: String, date: String): Flow<RegisterSyncState> = sync

    override suspend fun discardLocal(sectionId: String, date: String) {
        discardCalls++
    }

    override suspend fun requestCorrection(entryId: String, newStatus: AttendanceStatus, reason: String): AppResult<Unit> = AppResult.Success(Unit)

    override suspend fun studentHistory(studentId: String, from: String?, to: String?): AppResult<StudentAttendance> =
        AppResult.Failure(AppError.Network)

    override suspend fun branchSummary(branchId: String?, date: String): AppResult<List<SectionAttendance>> = AppResult.Success(summary)

    override suspend fun unmarked(branchId: String?, date: String): AppResult<List<UnmarkedSection>> = AppResult.Success(unmarkedSections)

    override suspend fun myStaffAttendance(from: String?, to: String?): AppResult<MyStaffAttendance> = AppResult.Failure(AppError.Network)
}

internal class FakeHealthRepository(private val alerts: List<HealthAlert> = emptyList()) : HealthRepository {
    override suspend fun profile(studentId: String): AppResult<HealthProfile> = error("unused")
    override suspend fun requestChange(studentId: String, change: HealthChangeInput): AppResult<Unit> = error("unused")
    override suspend fun alerts(sectionId: String): AppResult<List<HealthAlert>> = AppResult.Success(alerts)
    override suspend fun incidents(studentId: String?, branchId: String?, from: String?, to: String?): AppResult<List<Incident>> = error("unused")
    override suspend fun reportIncident(input: IncidentInput): AppResult<Incident> = error("unused")
    override suspend fun closeIncident(id: String, note: String?): AppResult<Incident> = error("unused")
}

internal class FakeLeaveRepository(var items: List<LeaveRequest> = emptyList()) : LeaveRepository {
    val requests = mutableListOf<LeaveInput>()

    override suspend fun leaves(scope: LeaveScope, status: LeaveStatus?, branchId: String?): AppResult<List<LeaveRequest>> =
        AppResult.Success(items.filter { status == null || it.status == status })

    override suspend fun request(input: LeaveInput): AppResult<LeaveRequest> {
        requests += input
        val subject = if (input is LeaveInput.ForStudent) PersonRef(input.studentId, "Child") else PersonRef("u1", "Me")
        return AppResult.Success(
            LeaveRequest("l${requests.size}", LeaveKind.STUDENT, subject, input.from, input.to, 1, null, input.reason, LeaveStatus.SUBMITTED, null, null, null, null),
        )
    }

    override suspend fun approve(id: String, comment: String?): AppResult<LeaveRequest> = error("unused")
    override suspend fun reject(id: String, comment: String?): AppResult<LeaveRequest> = error("unused")
    override suspend fun cancel(id: String): AppResult<LeaveRequest> =
        AppResult.Success(items.first { it.id == id }.copy(status = LeaveStatus.CANCELLED))
}
