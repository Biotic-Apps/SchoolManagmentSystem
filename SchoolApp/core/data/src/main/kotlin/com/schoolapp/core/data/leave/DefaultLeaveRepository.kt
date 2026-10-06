package com.schoolapp.core.data.leave

import com.schoolapp.core.common.result.AppResult
import com.schoolapp.core.data.common.clean
import com.schoolapp.core.model.leave.LeaveInput
import com.schoolapp.core.model.leave.LeaveRequest
import com.schoolapp.core.model.leave.LeaveScope
import com.schoolapp.core.model.leave.LeaveStatus
import com.schoolapp.core.network.ApiCaller
import com.schoolapp.core.network.api.LeaveApi
import com.schoolapp.core.network.dto.common.CommentBodyDto
import javax.inject.Inject
import javax.inject.Singleton

@Singleton
class DefaultLeaveRepository @Inject constructor(
    private val api: LeaveApi,
    private val apiCaller: ApiCaller,
) : LeaveRepository {

    override suspend fun leaves(scope: LeaveScope, status: LeaveStatus?, branchId: String?): AppResult<List<LeaveRequest>> =
        apiCaller.call {
            api.leaves(scope.name.lowercase(), status?.name, branchId).data.map { it.toModel() }
                .sortedByDescending { it.createdAt ?: it.from }
        }

    override suspend fun request(input: LeaveInput): AppResult<LeaveRequest> =
        apiCaller.call { api.request(input.toBody()).data.toModel() }

    override suspend fun approve(id: String, comment: String?): AppResult<LeaveRequest> =
        apiCaller.call { api.approve(id, CommentBodyDto(comment.clean())).data.toModel() }

    override suspend fun reject(id: String, comment: String?): AppResult<LeaveRequest> =
        apiCaller.call { api.reject(id, CommentBodyDto(comment.clean())).data.toModel() }

    override suspend fun cancel(id: String): AppResult<LeaveRequest> =
        apiCaller.call { api.cancel(id, CommentBodyDto()).data.toModel() }
}
