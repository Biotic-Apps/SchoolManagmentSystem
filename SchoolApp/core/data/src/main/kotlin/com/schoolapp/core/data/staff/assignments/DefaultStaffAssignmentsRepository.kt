package com.schoolapp.core.data.staff.assignments

import com.schoolapp.core.common.result.AppResult
import com.schoolapp.core.data.staff.toModel
import com.schoolapp.core.model.staff.StaffAssignment
import com.schoolapp.core.model.staff.StaffDetail
import com.schoolapp.core.model.staff.StaffSummary
import com.schoolapp.core.model.staff.assignments.NewStaffAssignment
import com.schoolapp.core.network.ApiCaller
import com.schoolapp.core.network.api.StaffApi
import com.schoolapp.core.network.api.staff.StaffAssignmentsApi
import com.schoolapp.core.network.dto.staff.assignments.NewAssignmentRequest
import com.schoolapp.core.network.dto.staff.assignments.ProbationRequest
import javax.inject.Inject
import javax.inject.Singleton

@Singleton
class DefaultStaffAssignmentsRepository @Inject constructor(
    private val api: StaffAssignmentsApi,
    private val staffApi: StaffApi,
    private val apiCaller: ApiCaller,
) : StaffAssignmentsRepository {

    override suspend fun setProbation(staffId: String, requiresReview: Boolean, reviewerUserId: String?): AppResult<StaffDetail> =
        apiCaller.call {
            val body = ProbationRequest(requiresReview, reviewerUserId.takeIf { requiresReview })
            api.setProbation(staffId, body).data.toModel()
        }

    override suspend fun activeStaff(branchId: String): AppResult<List<StaffSummary>> = apiCaller.call {
        staffApi.staff(branchId = branchId, status = "ACTIVE").data.map { it.toModel() }.sortedBy { it.name }
    }

    override suspend fun assignments(staffId: String, sessionId: String?): AppResult<List<StaffAssignment>> =
        apiCaller.call { api.assignments(staffId, sessionId).data.map { it.toModel() } }

    override suspend fun add(staffId: String, input: NewStaffAssignment): AppResult<Unit> = apiCaller.call {
        val body = NewAssignmentRequest(
            kind = input.kind,
            sessionId = input.sessionId,
            branchId = input.branchId,
            sectionId = input.sectionId?.takeIf { it.isNotBlank() },
            subjectId = input.subjectId.takeIf { input.kind == NewStaffAssignment.SUBJECT_TEACHER },
            responsibleStaffId = input.responsibleStaffId?.takeIf { input.kind == NewStaffAssignment.HELPER && it.isNotBlank() },
            validUntil = input.validUntil.takeIf { input.isSubstitute },
            isSubstitute = true.takeIf { input.isSubstitute },
        )
        api.add(staffId, body)
        Unit
    }

    override suspend fun end(staffId: String, assignmentId: String): AppResult<Unit> = apiCaller.call {
        api.end(staffId, assignmentId)
        Unit
    }
}
