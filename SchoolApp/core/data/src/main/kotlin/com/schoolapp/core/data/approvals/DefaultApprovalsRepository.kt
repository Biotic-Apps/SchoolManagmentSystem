package com.schoolapp.core.data.approvals

import com.schoolapp.core.common.result.AppResult
import com.schoolapp.core.model.approval.ApprovalDecision
import com.schoolapp.core.model.approval.ApprovalRequest
import com.schoolapp.core.model.approval.ApprovalStatus
import com.schoolapp.core.network.ApiCaller
import com.schoolapp.core.network.api.ApprovalsApi
import com.schoolapp.core.network.dto.approval.DecisionRequestDto
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.MutableSharedFlow
import kotlinx.coroutines.flow.asSharedFlow
import javax.inject.Inject
import javax.inject.Singleton

@Singleton
class DefaultApprovalsRepository @Inject constructor(
    private val api: ApprovalsApi,
    private val apiCaller: ApiCaller,
) : ApprovalsRepository {

    private val changeSignal = MutableSharedFlow<Unit>(extraBufferCapacity = 1)
    override val changes: Flow<Unit> = changeSignal.asSharedFlow()

    override suspend fun inbox(status: ApprovalStatus?): AppResult<List<ApprovalRequest>> =
        apiCaller.call { api.list(status = status?.name).data.map { it.toModel() } }

    override suspend fun detail(id: String): AppResult<ApprovalRequest> =
        apiCaller.call { api.detail(id).data.toModel() }

    override suspend fun decide(id: String, decision: ApprovalDecision, comment: String?): AppResult<Unit> {
        val body = DecisionRequestDto(decision.name, comment?.trim()?.takeIf { it.isNotEmpty() })
        return apiCaller.call { api.decide(id, body) }.also {
            if (it is AppResult.Success) changeSignal.tryEmit(Unit)
        }
    }
}
