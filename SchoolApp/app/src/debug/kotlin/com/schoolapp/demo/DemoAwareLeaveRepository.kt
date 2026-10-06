package com.schoolapp.demo

import com.schoolapp.core.common.result.AppError
import com.schoolapp.core.common.result.AppResult
import com.schoolapp.core.data.leave.DefaultLeaveRepository
import com.schoolapp.core.data.leave.LeaveRepository
import com.schoolapp.core.model.RoleKey
import com.schoolapp.core.model.common.PersonRef
import com.schoolapp.core.model.leave.LeaveInput
import com.schoolapp.core.model.leave.LeaveKind
import com.schoolapp.core.model.leave.LeaveRequest
import com.schoolapp.core.model.leave.LeaveScope
import com.schoolapp.core.model.leave.LeaveStatus
import kotlinx.coroutines.flow.update
import javax.inject.Inject
import javax.inject.Singleton

@Singleton
class DemoAwareLeaveRepository @Inject constructor(
    private val real: DefaultLeaveRepository,
    private val auth: DemoAwareAuthRepository,
) : LeaveRepository {

    override suspend fun leaves(scope: LeaveScope, status: LeaveStatus?, branchId: String?): AppResult<List<LeaveRequest>> {
        if (!auth.isDemoActive) return real.leaves(scope, status, branchId)
        val role = auth.demoSession.value?.activeRole
        val me = DemoActors.forRole(role)
        val visible = DemoLeaveData.leaves.value.filter { leave ->
            when (scope) {
                LeaveScope.MINE -> leave.requestedBy?.id == me.id
                LeaveScope.REVIEW -> leave.requestedBy?.id != me.id && canReview(role, leave)
            }
        }
        return AppResult.Success(visible.filter { status == null || it.status == status }.sortedByDescending { it.createdAt })
    }

    override suspend fun request(input: LeaveInput): AppResult<LeaveRequest> {
        if (!auth.isDemoActive) return real.request(input)
        val me = DemoActors.forRole(auth.demoSession.value?.activeRole)
        val leave = LeaveRequest(
            id = "demo-lv-${System.currentTimeMillis()}",
            kind = if (input is LeaveInput.ForStudent) LeaveKind.STUDENT else LeaveKind.STAFF,
            subject = when (input) {
                is LeaveInput.ForStudent -> PersonRef(input.studentId, studentName(input.studentId))
                is LeaveInput.ForSelf -> me
            },
            from = input.from,
            to = input.to,
            days = DemoLeaveData.days(input.from, input.to),
            type = (input as? LeaveInput.ForSelf)?.type,
            reason = input.reason,
            status = LeaveStatus.SUBMITTED,
            requestedBy = me,
            decidedBy = null,
            comment = null,
            createdAt = DemoDates.isoNow(),
        )
        DemoLeaveData.leaves.update { listOf(leave) + it }
        return AppResult.Success(leave)
    }

    override suspend fun approve(id: String, comment: String?): AppResult<LeaveRequest> =
        if (auth.isDemoActive) decide(id, LeaveStatus.APPROVED, comment) else real.approve(id, comment)

    override suspend fun reject(id: String, comment: String?): AppResult<LeaveRequest> =
        if (auth.isDemoActive) decide(id, LeaveStatus.REJECTED, comment) else real.reject(id, comment)

    override suspend fun cancel(id: String): AppResult<LeaveRequest> =
        if (auth.isDemoActive) decide(id, LeaveStatus.CANCELLED, null) else real.cancel(id)

    private fun decide(id: String, status: LeaveStatus, comment: String?): AppResult<LeaveRequest> {
        val me = DemoActors.forRole(auth.demoSession.value?.activeRole)
        DemoLeaveData.leaves.update { list ->
            list.map {
                if (it.id != id) it else it.copy(status = status, comment = comment, decidedBy = if (status == LeaveStatus.CANCELLED) null else me)
            }
        }
        val updated = DemoLeaveData.leaves.value.firstOrNull { it.id == id }
        return updated?.let { AppResult.Success(it) } ?: AppResult.Failure(AppError.Server(404, "NOT_FOUND", null))
    }

    private fun canReview(role: com.schoolapp.core.model.RoleRef?, leave: LeaveRequest): Boolean = when (role) {
        RoleKey.PRINCIPAL, RoleKey.COORDINATOR, RoleKey.HEAD_TEACHER, RoleKey.SUPER_ADMIN -> true
        RoleKey.TEACHER -> leave.kind == LeaveKind.STUDENT &&
            DemoPeopleData.students.any { it.id == leave.subject.id && it.sectionId in DemoAwareStudentsRepository.TEACHER_SECTIONS }
        else -> false
    }

    private fun studentName(id: String) = DemoPeopleData.students.firstOrNull { it.id == id }?.name ?: "Student"
}
