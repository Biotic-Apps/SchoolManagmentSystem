package com.schoolapp.core.data.settings

import com.schoolapp.core.common.result.AppResult
import com.schoolapp.core.model.settings.FailedNotification
import com.schoolapp.core.model.settings.FailedNotificationFilters
import com.schoolapp.core.model.settings.JobFilters
import com.schoolapp.core.model.settings.JobRun
import com.schoolapp.core.model.settings.PagedList
import com.schoolapp.core.model.settings.SystemHealth
import com.schoolapp.core.model.settings.TestMessageResult
import com.schoolapp.core.network.ApiCaller
import com.schoolapp.core.network.api.settings.SupportApi
import com.schoolapp.core.network.dto.settings.ResendAllBodyDto
import com.schoolapp.core.network.dto.settings.TestMessageBodyDto
import javax.inject.Inject
import javax.inject.Singleton

@Singleton
class DefaultSupportRepository @Inject constructor(
    private val api: SupportApi,
    private val apiCaller: ApiCaller,
) : SupportRepository {

    override suspend fun health(): AppResult<SystemHealth> = apiCaller.call { api.health().data.toModel() }

    override suspend fun failedNotifications(
        schoolId: String,
        filters: FailedNotificationFilters,
        page: Int,
        pageSize: Int,
    ): AppResult<PagedList<FailedNotification>> = apiCaller.call {
        val envelope = api.failedNotifications(schoolId, filters.channel, filters.from, filters.to, page, pageSize)
        val items = envelope.data.map { it.toModel() }
        PagedList(items, page, pageSize, envelope.meta?.total ?: items.size)
    }

    override suspend fun resend(id: String): AppResult<Unit> = apiCaller.call { api.resend(id) }

    override suspend fun resendAll(schoolId: String, filters: FailedNotificationFilters): AppResult<Unit> =
        apiCaller.call { api.resendAll(ResendAllBodyDto(schoolId, filters.channel, filters.from, filters.to)) }

    override suspend fun jobs(filters: JobFilters, page: Int, pageSize: Int): AppResult<PagedList<JobRun>> = apiCaller.call {
        val envelope = api.jobs(filters.queue, filters.status, filters.from, page, pageSize)
        val items = envelope.data.map { it.toModel() }
        PagedList(items, page, pageSize, envelope.meta?.total ?: items.size)
    }

    override suspend fun retryJob(id: String): AppResult<Unit> = apiCaller.call { api.retryJob(id) }

    override suspend fun sendTestMessage(channel: String, to: String): AppResult<TestMessageResult> = apiCaller.call {
        val data = api.testMessage(TestMessageBodyDto(channel, to.trim())).data
        TestMessageResult(data.ok, data.error)
    }
}
