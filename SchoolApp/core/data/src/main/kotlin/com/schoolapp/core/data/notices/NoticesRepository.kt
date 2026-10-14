package com.schoolapp.core.data.notices

import com.schoolapp.core.common.result.AppResult
import com.schoolapp.core.model.notice.Notice
import com.schoolapp.core.model.notice.NoticeInput
import com.schoolapp.core.model.notice.NoticeReads
import com.schoolapp.core.model.notice.NoticeStatus
import com.schoolapp.core.model.settings.PagedList

interface NoticesRepository {
    /** One page (server order: pinned first, then newest). Recipients only get notices addressed to them. */
    suspend fun notices(
        branchId: String? = null,
        status: NoticeStatus? = null,
        page: Int = 1,
        pageSize: Int = DEFAULT_PAGE_SIZE,
    ): AppResult<PagedList<Notice>>

    /** Creates a draft, or updates one when [id] is given. */
    suspend fun save(id: String?, input: NoticeInput): AppResult<Notice>

    /** Publishes a draft; teachers' notices may come back as PENDING_REVIEW. [draft] fills in a review-only reply. */
    suspend fun publish(id: String, draft: Notice? = null): AppResult<Notice>

    suspend fun markRead(id: String): AppResult<Unit>

    suspend fun reads(id: String): AppResult<NoticeReads>

    companion object {
        const val DEFAULT_PAGE_SIZE = 20
    }
}
