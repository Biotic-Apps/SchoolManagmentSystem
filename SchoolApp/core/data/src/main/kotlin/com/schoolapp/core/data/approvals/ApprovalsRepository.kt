package com.schoolapp.core.data.approvals

import com.schoolapp.core.common.result.AppResult
import com.schoolapp.core.model.approval.ApprovalDecision
import com.schoolapp.core.model.approval.ApprovalRequest
import com.schoolapp.core.model.approval.ApprovalStatus
import kotlinx.coroutines.flow.Flow

interface ApprovalsRepository {
    /** Emits after a decision is recorded so open inboxes can reload. */
    val changes: Flow<Unit>

    suspend fun inbox(status: ApprovalStatus?): AppResult<List<ApprovalRequest>>

    suspend fun detail(id: String): AppResult<ApprovalRequest>

    suspend fun decide(id: String, decision: ApprovalDecision, comment: String?): AppResult<Unit>
}
