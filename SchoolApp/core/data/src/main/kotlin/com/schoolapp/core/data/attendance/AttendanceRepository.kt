package com.schoolapp.core.data.attendance

import com.schoolapp.core.common.result.AppResult
import com.schoolapp.core.model.attendance.AttendanceStatus
import com.schoolapp.core.model.attendance.EntryMark
import com.schoolapp.core.model.attendance.LoadedRegister
import com.schoolapp.core.model.attendance.MyStaffAttendance
import com.schoolapp.core.model.attendance.RegisterOutcome
import com.schoolapp.core.model.attendance.RegisterSyncState
import com.schoolapp.core.model.attendance.SectionAttendance
import com.schoolapp.core.model.attendance.StudentAttendance
import com.schoolapp.core.model.attendance.UnmarkedSection
import kotlinx.coroutines.flow.Flow

/**
 * Student registers work fully offline: marks are saved in Room first, and a draft save or submit that
 * cannot reach the server is queued in the outbox with its clientRequestId (same id = same result).
 */
interface AttendanceRepository {
    /** Server register (cached for offline use), merged with any unsent marks kept on this device. */
    suspend fun register(sectionId: String, date: String): AppResult<LoadedRegister>

    /** `PUT /attendance/registers` (DRAFT). Helpers can only do this. */
    suspend fun saveDraft(sectionId: String, date: String, marks: List<EntryMark>, clientRequestId: String): AppResult<RegisterOutcome>

    /** `POST /attendance/registers/submit`; 409/423 come back as [RegisterOutcome.AlreadySubmitted] / [RegisterOutcome.Locked]. */
    suspend fun submit(sectionId: String, date: String, marks: List<EntryMark>, clientRequestId: String): AppResult<RegisterOutcome>

    /** Outbox state for the register (queued, or rejected by the server and needing review). */
    fun syncState(sectionId: String, date: String): Flow<RegisterSyncState>

    /** Drops this device's unsent marks and parked outbox rows so the server register is shown. */
    suspend fun discardLocal(sectionId: String, date: String)

    suspend fun requestCorrection(entryId: String, newStatus: AttendanceStatus, reason: String): AppResult<Unit>

    suspend fun studentHistory(studentId: String, from: String?, to: String?): AppResult<StudentAttendance>

    suspend fun branchSummary(branchId: String?, date: String): AppResult<List<SectionAttendance>>

    suspend fun unmarked(branchId: String?, date: String): AppResult<List<UnmarkedSection>>

    suspend fun myStaffAttendance(from: String?, to: String?): AppResult<MyStaffAttendance>
}
