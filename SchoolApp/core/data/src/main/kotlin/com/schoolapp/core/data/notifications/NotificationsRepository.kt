package com.schoolapp.core.data.notifications

import com.schoolapp.core.common.result.AppResult
import com.schoolapp.core.model.notification.AppNotification
import kotlinx.coroutines.flow.Flow

interface NotificationsRepository {
    /** Unread count, polled while collected and refreshed after read actions. Runs off the main thread. */
    val unreadCount: Flow<Int>

    suspend fun notifications(unreadOnly: Boolean): AppResult<List<AppNotification>>

    suspend fun markRead(id: String): AppResult<Unit>

    suspend fun markAllRead(): AppResult<Unit>
}
