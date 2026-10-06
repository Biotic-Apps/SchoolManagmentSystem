package com.schoolapp.core.data.notifications

import com.schoolapp.core.common.result.AppResult
import com.schoolapp.core.model.notification.NotificationPreference

interface NotificationPreferencesRepository {
    suspend fun preferences(): AppResult<List<NotificationPreference>>
    suspend fun update(preferences: List<NotificationPreference>): AppResult<List<NotificationPreference>>
}
