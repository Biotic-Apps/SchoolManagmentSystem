package com.schoolapp.feature.approvals

import com.schoolapp.core.common.result.AppError
import com.schoolapp.core.common.result.AppResult
import com.schoolapp.core.data.approvals.ApprovalsRepository
import com.schoolapp.core.model.approval.ApprovalDecision
import com.schoolapp.core.model.approval.ApprovalRequest
import com.schoolapp.core.model.approval.ApprovalStatus
import kotlinx.coroutines.CompletableDeferred
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.MutableSharedFlow

class FakeApprovalsRepository(requests: List<ApprovalRequest>) : ApprovalsRepository {
    private val items = requests.associateBy { it.id }.toMutableMap()
    val decisions = mutableListOf<Triple<String, ApprovalDecision, String?>>()
    val inboxCalls = mutableListOf<ApprovalStatus?>()
    var decideError: AppError? = null
    var decideGate: CompletableDeferred<Unit>? = null
    val changeSignal = MutableSharedFlow<Unit>(extraBufferCapacity = 1)

    override val changes: Flow<Unit> = changeSignal

    override suspend fun inbox(status: ApprovalStatus?): AppResult<List<ApprovalRequest>> {
        inboxCalls += status
        return AppResult.Success(items.values.filter { status == null || it.status == status })
    }

    override suspend fun detail(id: String): AppResult<ApprovalRequest> =
        items[id]?.let { AppResult.Success(it) } ?: AppResult.Failure(AppError.Server(404, "NOT_FOUND", null))

    override suspend fun decide(id: String, decision: ApprovalDecision, comment: String?): AppResult<Unit> {
        decisions += Triple(id, decision, comment)
        decideGate?.await()
        decideError?.let { return AppResult.Failure(it) }
        items[id] = items.getValue(id).copy(status = ApprovalStatus.fromKey(decision.name))
        changeSignal.tryEmit(Unit)
        return AppResult.Success(Unit)
    }
}
