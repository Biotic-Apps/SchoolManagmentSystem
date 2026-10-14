package com.schoolapp.core.data.approvals

import com.schoolapp.core.common.result.AppResult
import com.schoolapp.core.model.approval.ApprovalDecision
import com.schoolapp.core.model.approval.ApprovalRequest
import com.schoolapp.core.model.approval.ApprovalStatus
import com.schoolapp.core.model.settings.PagedList
import kotlinx.coroutines.flow.Flow

interface ApprovalsRepository {
    /** Emits after a decision is recorded so open inboxes can reload. */
    val changes: Flow<Unit>

    suspend fun inbox(status: ApprovalStatus?): AppResult<List<ApprovalRequest>>

    /** One server page of the inbox, optionally filtered by request [type] (e.g. `LEAVE`). */
    suspend fun inboxPage(status: ApprovalStatus?, type: String?, page: Int, pageSize: Int = 20): AppResult<PagedList<ApprovalRequest>> =
        when (val result = inbox(status)) {
            is AppResult.Success -> {
                val items = result.data.filter { type == null || it.type == type }
                AppResult.Success(PagedList(items, 1, items.size.coerceAtLeast(1), items.size))
            }
            is AppResult.Failure -> result
        }

    suspend fun detail(id: String): AppResult<ApprovalRequest>

    suspend fun decide(id: String, decision: ApprovalDecision, comment: String?): AppResult<Unit>
}
