package com.schoolapp.core.data.notices

import com.schoolapp.core.common.result.AppResult
import com.schoolapp.core.data.common.isPendingReview
import com.schoolapp.core.model.notice.Notice
import com.schoolapp.core.model.notice.NoticeInput
import com.schoolapp.core.model.notice.NoticeReads
import com.schoolapp.core.model.notice.NoticeStatus
import com.schoolapp.core.model.settings.PagedList
import com.schoolapp.core.network.ApiCaller
import com.schoolapp.core.network.api.NoticesApi
import com.schoolapp.core.network.dto.notice.NoticeDto
import kotlinx.serialization.json.Json
import javax.inject.Inject
import javax.inject.Singleton

@Singleton
class DefaultNoticesRepository @Inject constructor(
    private val api: NoticesApi,
    private val apiCaller: ApiCaller,
    private val json: Json,
) : NoticesRepository {

    override suspend fun notices(branchId: String?, status: NoticeStatus?, page: Int, pageSize: Int): AppResult<PagedList<Notice>> =
        apiCaller.call {
            val envelope = api.notices(branchId, status?.name, page, pageSize)
            val items = envelope.data.map { it.toModel() }
            PagedList(items, page, pageSize, envelope.meta?.total ?: ((page - 1) * pageSize + items.size))
        }

    override suspend fun save(id: String?, input: NoticeInput): AppResult<Notice> = apiCaller.call {
        val body = input.toBody()
        (if (id == null) api.create(body) else api.update(id, body)).data.toModel()
    }

    override suspend fun publish(id: String, draft: Notice?): AppResult<Notice> = apiCaller.call {
        val published = api.publish(id).data
        if (published.isPendingReview() && !published.containsKey("id")) {
            (draft ?: Notice(id, "", "", NoticeStatus.PENDING_REVIEW, false, null, null, null, null, true))
                .copy(status = NoticeStatus.PENDING_REVIEW)
        } else {
            json.decodeFromJsonElement(NoticeDto.serializer(), published).toModel()
        }
    }

    override suspend fun markRead(id: String): AppResult<Unit> = apiCaller.call { api.markRead(id) }

    override suspend fun reads(id: String): AppResult<NoticeReads> = apiCaller.call {
        val dto = api.reads(id).data
        NoticeReads(dto.total, dto.read, dto.unread ?: (dto.total - dto.read).coerceAtLeast(0))
    }
}
