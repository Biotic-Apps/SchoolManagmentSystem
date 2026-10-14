package com.schoolapp.feature.diary.moderation

import com.schoolapp.core.common.result.AppResult
import com.schoolapp.core.data.approvals.ApprovalsRepository
import com.schoolapp.core.data.diary.DiaryRepository
import com.schoolapp.core.model.approval.ApprovalDecision
import com.schoolapp.core.model.diary.DiaryEntry
import javax.inject.Inject

/**
 * Supervisor "Publish" on a SUBMITTED entry. The API only publishes DRAFT/RETURNED entries through
 * `POST /diary/{id}/publish`; a moderated (SUBMITTED) entry is published by approving its DIARY_MODERATION
 * request, so that path is used whenever the entry carries an approval id.
 */
class SubmittedEntryPublisher @Inject constructor(
    private val diaryRepository: DiaryRepository,
    private val approvalsRepository: ApprovalsRepository,
) {
    suspend fun publish(entry: DiaryEntry): AppResult<Unit> {
        val approvalId = entry.approvalId
        return if (approvalId != null) {
            approvalsRepository.decide(approvalId, ApprovalDecision.APPROVED, null)
        } else {
            when (val result = diaryRepository.publishEntry(entry.id)) {
                is AppResult.Success -> AppResult.Success(Unit)
                is AppResult.Failure -> result
            }
        }
    }
}
