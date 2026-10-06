package com.schoolapp.core.data.notices

import com.schoolapp.core.common.result.AppResult
import com.schoolapp.core.data.common.isPendingReview
import com.schoolapp.core.model.notice.Notice
import com.schoolapp.core.model.notice.NoticeInput
import com.schoolapp.core.model.notice.NoticeStatus
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

    override suspend fun notices(branchId: String?): AppResult<List<Notice>> =
        apiCaller.call { api.notices(branchId).data.map { it.toModel() }.ordered() }

    override suspend fun createAndPublish(input: NoticeInput): AppResult<Notice> {
        val created = when (val result = apiCaller.call { api.create(input.toBody()).data }) {
            is AppResult.Success -> result.data
            is AppResult.Failure -> return result
        }
        return apiCaller.call {
            val published = api.publish(created.id).data
            if (published.isPendingReview() && !published.containsKey("id")) {
                created.toModel().copy(status = NoticeStatus.PENDING_REVIEW)
            } else {
                json.decodeFromJsonElement(NoticeDto.serializer(), published).toModel()
            }
        }
    }

    override suspend fun markRead(id: String): AppResult<Unit> = apiCaller.call { api.markRead(id) }
}
