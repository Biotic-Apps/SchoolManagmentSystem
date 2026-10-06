package com.schoolapp.core.data.notices

import com.schoolapp.core.common.result.AppResult
import com.schoolapp.core.model.notice.Notice
import com.schoolapp.core.model.notice.NoticeInput

interface NoticesRepository {
    /** Pinned first, then newest. */
    suspend fun notices(branchId: String? = null): AppResult<List<Notice>>

    /** Creates then publishes (teachers' notices may go to review). */
    suspend fun createAndPublish(input: NoticeInput): AppResult<Notice>

    suspend fun markRead(id: String): AppResult<Unit>
}
