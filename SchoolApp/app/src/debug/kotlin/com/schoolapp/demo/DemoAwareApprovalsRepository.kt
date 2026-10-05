package com.schoolapp.demo

import com.schoolapp.core.common.result.AppError
import com.schoolapp.core.common.result.AppResult
import com.schoolapp.core.data.approvals.ApprovalsRepository
import com.schoolapp.core.data.approvals.DefaultApprovalsRepository
import com.schoolapp.core.model.approval.ApprovalDecision
import com.schoolapp.core.model.approval.ApprovalRequest
import com.schoolapp.core.model.approval.ApprovalStatus
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.MutableSharedFlow
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.merge
import kotlinx.coroutines.flow.update
import javax.inject.Inject
import javax.inject.Singleton

@Singleton
class DemoAwareApprovalsRepository @Inject constructor(
    private val real: DefaultApprovalsRepository,
    private val auth: DemoAwareAuthRepository,
) : ApprovalsRepository {

    private val demoItems = MutableStateFlow(DemoData.approvals)
    private val demoChanges = MutableSharedFlow<Unit>(extraBufferCapacity = 1)

    override val changes: Flow<Unit> = merge(real.changes, demoChanges)

    override suspend fun inbox(status: ApprovalStatus?): AppResult<List<ApprovalRequest>> =
        if (auth.isDemoActive) {
            AppResult.Success(demoItems.value.filter { status == null || it.status == status })
        } else {
            real.inbox(status)
        }

    override suspend fun detail(id: String): AppResult<ApprovalRequest> {
        if (!auth.isDemoActive) return real.detail(id)
        return demoItems.value.firstOrNull { it.id == id }?.let { AppResult.Success(it) }
            ?: AppResult.Failure(AppError.Server(NOT_FOUND, "NOT_FOUND", null))
    }

    override suspend fun decide(id: String, decision: ApprovalDecision, comment: String?): AppResult<Unit> {
        if (!auth.isDemoActive) return real.decide(id, decision, comment)
        demoItems.update { list ->
            list.map { if (it.id == id) it.copy(status = ApprovalStatus.fromKey(decision.name)) else it }
        }
        demoChanges.tryEmit(Unit)
        return AppResult.Success(Unit)
    }

    private companion object {
        const val NOT_FOUND = 404
    }
}
