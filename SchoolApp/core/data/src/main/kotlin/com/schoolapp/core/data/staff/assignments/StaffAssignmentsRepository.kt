package com.schoolapp.core.data.staff.assignments

import com.schoolapp.core.common.result.AppResult
import com.schoolapp.core.model.staff.StaffAssignment
import com.schoolapp.core.model.staff.StaffDetail
import com.schoolapp.core.model.staff.StaffSummary
import com.schoolapp.core.model.staff.assignments.NewStaffAssignment

/** Probation review and session assignments of a staff member; same endpoints as the web staff profile. */
interface StaffAssignmentsRepository {
    /** Principal / super admin only; [reviewerUserId] is required when [requiresReview]. */
    suspend fun setProbation(staffId: String, requiresReview: Boolean, reviewerUserId: String?): AppResult<StaffDetail>

    /** Active staff of a branch (reviewer and responsible-teacher pickers). */
    suspend fun activeStaff(branchId: String): AppResult<List<StaffSummary>>

    suspend fun assignments(staffId: String, sessionId: String?): AppResult<List<StaffAssignment>>

    suspend fun add(staffId: String, input: NewStaffAssignment): AppResult<Unit>

    suspend fun end(staffId: String, assignmentId: String): AppResult<Unit>
}
