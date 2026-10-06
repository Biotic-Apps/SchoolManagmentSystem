package com.schoolapp.demo

import com.schoolapp.core.common.result.AppError
import com.schoolapp.core.common.result.AppResult
import com.schoolapp.core.data.attendance.AttendanceRepository
import com.schoolapp.core.data.attendance.DefaultAttendanceRepository
import com.schoolapp.core.model.RoleKey
import com.schoolapp.core.model.attendance.AttendanceDay
import com.schoolapp.core.model.attendance.AttendanceRegister
import com.schoolapp.core.model.attendance.AttendanceStatus
import com.schoolapp.core.model.attendance.AttendanceSummary
import com.schoolapp.core.model.attendance.EntryMark
import com.schoolapp.core.model.attendance.LoadedRegister
import com.schoolapp.core.model.attendance.MyStaffAttendance
import com.schoolapp.core.model.attendance.RegisterOutcome
import com.schoolapp.core.model.attendance.RegisterStatus
import com.schoolapp.core.model.attendance.RegisterSyncState
import com.schoolapp.core.model.attendance.SectionAttendance
import com.schoolapp.core.model.attendance.StudentAttendance
import com.schoolapp.core.model.attendance.UnmarkedSection
import kotlinx.coroutines.ExperimentalCoroutinesApi
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.flatMapLatest
import kotlinx.coroutines.flow.flowOf
import javax.inject.Inject
import javax.inject.Singleton

@Singleton
class DemoAwareAttendanceRepository @Inject constructor(
    private val real: DefaultAttendanceRepository,
    private val auth: DemoAwareAuthRepository,
) : AttendanceRepository {

    override suspend fun register(sectionId: String, date: String): AppResult<LoadedRegister> =
        if (auth.isDemoActive) {
            AppResult.Success(LoadedRegister(DemoAttendanceData.register(sectionId, date)))
        } else {
            real.register(sectionId, date)
        }

    override suspend fun saveDraft(sectionId: String, date: String, marks: List<EntryMark>, clientRequestId: String): AppResult<RegisterOutcome> {
        if (!auth.isDemoActive) return real.saveDraft(sectionId, date, marks, clientRequestId)
        val current = DemoAttendanceData.register(sectionId, date)
        blockedOutcome(current, date)?.let { return AppResult.Success(it) }
        val saved = current.copy(
            id = current.id ?: "demo-ar-$sectionId-$date",
            status = RegisterStatus.DRAFT,
            version = current.version + 1,
            submittedBy = actor(),
            entries = DemoAttendanceData.applyMarks(current, marks),
        )
        DemoAttendanceData.put(saved)
        return AppResult.Success(RegisterOutcome.Saved(saved))
    }

    override suspend fun submit(sectionId: String, date: String, marks: List<EntryMark>, clientRequestId: String): AppResult<RegisterOutcome> {
        if (!auth.isDemoActive) return real.submit(sectionId, date, marks, clientRequestId)
        if (auth.demoSession.value?.activeRole == RoleKey.HELPER) return AppResult.Failure(AppError.Forbidden("FORBIDDEN"))
        val current = DemoAttendanceData.register(sectionId, date)
        blockedOutcome(current, date)?.let { return AppResult.Success(it) }
        val actor = actor()
        val saved = current.copy(
            id = current.id ?: "demo-ar-$sectionId-$date",
            status = RegisterStatus.SUBMITTED,
            version = current.version + 1,
            submittedBy = actor,
            onBehalfOf = if (actor == DemoActors.teacher) null else DemoActors.teacher,
            entries = DemoAttendanceData.applyMarks(current, marks),
        )
        DemoAttendanceData.put(saved)
        return AppResult.Success(RegisterOutcome.Saved(saved))
    }

    @OptIn(ExperimentalCoroutinesApi::class)
    override fun syncState(sectionId: String, date: String): Flow<RegisterSyncState> =
        auth.demoActive.flatMapLatest { demo -> if (demo) flowOf(RegisterSyncState.NONE) else real.syncState(sectionId, date) }

    override suspend fun discardLocal(sectionId: String, date: String) {
        if (!auth.isDemoActive) real.discardLocal(sectionId, date)
    }

    override suspend fun requestCorrection(entryId: String, newStatus: AttendanceStatus, reason: String): AppResult<Unit> =
        if (auth.isDemoActive) AppResult.Success(Unit) else real.requestCorrection(entryId, newStatus, reason)

    override suspend fun studentHistory(studentId: String, from: String?, to: String?): AppResult<StudentAttendance> {
        if (!auth.isDemoActive) return real.studentHistory(studentId, from, to)
        val days = DemoAttendanceData.all()
            .filter { DemoDates.inRange(it.date, from, to) && it.status.isFinal }
            .mapNotNull { reg -> reg.entries.firstOrNull { it.studentId == studentId }?.let { AttendanceDay(reg.date, it.status, it.remark) } }
            .sortedByDescending { it.date }
        return AppResult.Success(StudentAttendance(days, summarize(days)))
    }

    override suspend fun branchSummary(branchId: String?, date: String): AppResult<List<SectionAttendance>> {
        if (!auth.isDemoActive) return real.branchSummary(branchId, date)
        return AppResult.Success(DemoPeopleData.sections.map { section -> sectionSummary(section.id, date) })
    }

    override suspend fun unmarked(branchId: String?, date: String): AppResult<List<UnmarkedSection>> =
        if (auth.isDemoActive) AppResult.Success(demoUnmarked(date)) else real.unmarked(branchId, date)

    override suspend fun myStaffAttendance(from: String?, to: String?): AppResult<MyStaffAttendance> =
        if (auth.isDemoActive) AppResult.Success(DemoStaffAttendanceData.mine(from, to)) else real.myStaffAttendance(from, to)

    private fun actor() = DemoActors.forRole(auth.demoSession.value?.activeRole)

    private fun blockedOutcome(current: AttendanceRegister, date: String): RegisterOutcome? = when {
        current.status == RegisterStatus.LOCKED || (date < DemoDates.todayKey() && current.status.isFinal) -> RegisterOutcome.Locked
        current.status.isFinal -> RegisterOutcome.AlreadySubmitted(current)
        else -> null
    }

    private fun sectionSummary(sectionId: String, date: String): SectionAttendance {
        val section = DemoPeopleData.sections.first { it.id == sectionId }
        val reg = DemoAttendanceData.register(sectionId, date)
        val counted = if (reg.status.isFinal) reg.entries.mapNotNull { it.status } else emptyList()
        return SectionAttendance(
            sectionId = sectionId,
            className = section.className,
            sectionName = section.name,
            status = reg.status,
            present = counted.count { it == AttendanceStatus.PRESENT || it == AttendanceStatus.HALF_DAY },
            absent = counted.count { it == AttendanceStatus.ABSENT },
            late = counted.count { it == AttendanceStatus.LATE },
            leave = counted.count { it == AttendanceStatus.LEAVE },
            total = reg.entries.size,
        )
    }

    private fun summarize(days: List<AttendanceDay>): AttendanceSummary {
        fun count(status: AttendanceStatus) = days.count { it.status == status }
        val marked = days.count { it.status != null }
        val attended = count(AttendanceStatus.PRESENT) + count(AttendanceStatus.LATE) + count(AttendanceStatus.HALF_DAY)
        return AttendanceSummary(
            present = count(AttendanceStatus.PRESENT),
            absent = count(AttendanceStatus.ABSENT),
            late = count(AttendanceStatus.LATE),
            leave = count(AttendanceStatus.LEAVE),
            halfDay = count(AttendanceStatus.HALF_DAY),
            unmarked = days.size - marked,
            percent = if (marked == 0) 0 else attended * 100 / marked,
        )
    }

    internal companion object {
        /** Sections with no submitted register on [date] (a draft still counts as unmarked). */
        fun demoUnmarked(date: String): List<UnmarkedSection> = DemoPeopleData.sections
            .filterNot { DemoAttendanceData.register(it.id, date).status.isFinal }
            .map { UnmarkedSection(it.id, it.className, it.name) }
    }
}
