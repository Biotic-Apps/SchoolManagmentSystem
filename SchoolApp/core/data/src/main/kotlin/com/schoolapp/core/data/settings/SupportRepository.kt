package com.schoolapp.core.data.settings

import com.schoolapp.core.common.result.AppResult
import com.schoolapp.core.model.settings.FailedNotification
import com.schoolapp.core.model.settings.FailedNotificationFilters
import com.schoolapp.core.model.settings.JobFilters
import com.schoolapp.core.model.settings.JobRun
import com.schoolapp.core.model.settings.PagedList
import com.schoolapp.core.model.settings.SystemHealth
import com.schoolapp.core.model.settings.TestMessageResult

/** Settings › Support (super admin): health, failed notifications, background jobs, test message. */
interface SupportRepository {
    suspend fun health(): AppResult<SystemHealth>

    suspend fun failedNotifications(
        schoolId: String,
        filters: FailedNotificationFilters,
        page: Int,
        pageSize: Int,
    ): AppResult<PagedList<FailedNotification>>

    suspend fun resend(id: String): AppResult<Unit>

    suspend fun resendAll(schoolId: String, filters: FailedNotificationFilters): AppResult<Unit>

    suspend fun jobs(filters: JobFilters, page: Int, pageSize: Int): AppResult<PagedList<JobRun>>

    suspend fun retryJob(id: String): AppResult<Unit>

    /** [channel] is EMAIL or SMS; provider failures come back as `ok = false`, not as an error. */
    suspend fun sendTestMessage(channel: String, to: String): AppResult<TestMessageResult>
}
