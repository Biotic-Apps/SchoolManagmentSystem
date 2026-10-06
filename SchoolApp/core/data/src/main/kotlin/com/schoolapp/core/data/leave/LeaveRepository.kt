package com.schoolapp.core.data.leave

import com.schoolapp.core.common.result.AppResult
import com.schoolapp.core.model.leave.LeaveInput
import com.schoolapp.core.model.leave.LeaveRequest
import com.schoolapp.core.model.leave.LeaveScope
import com.schoolapp.core.model.leave.LeaveStatus

interface LeaveRepository {
    suspend fun leaves(scope: LeaveScope, status: LeaveStatus? = null, branchId: String? = null): AppResult<List<LeaveRequest>>
    suspend fun request(input: LeaveInput): AppResult<LeaveRequest>
    suspend fun approve(id: String, comment: String?): AppResult<LeaveRequest>
    suspend fun reject(id: String, comment: String?): AppResult<LeaveRequest>
    suspend fun cancel(id: String): AppResult<LeaveRequest>
}
