package com.schoolapp.core.data.notifications

import com.schoolapp.core.common.result.AppResult
import com.schoolapp.core.model.notification.NotificationPreference
import com.schoolapp.core.network.ApiCaller
import com.schoolapp.core.network.api.NotificationsApi
import com.schoolapp.core.network.dto.notification.NotificationPreferenceDto
import com.schoolapp.core.network.dto.notification.PreferenceInputDto
import javax.inject.Inject
import javax.inject.Singleton

@Singleton
class DefaultNotificationPreferencesRepository @Inject constructor(
    private val api: NotificationsApi,
    private val apiCaller: ApiCaller,
) : NotificationPreferencesRepository {

    override suspend fun preferences(): AppResult<List<NotificationPreference>> =
        apiCaller.call { api.preferences().data.map { it.toModel() } }

    /** Critical categories are always sent with push on; the server refuses to mute them. */
    override suspend fun update(preferences: List<NotificationPreference>): AppResult<List<NotificationPreference>> =
        apiCaller.call {
            val body = preferences.map { PreferenceInputDto(it.category, push = it.push || it.isCritical, inApp = it.inApp) }
            api.updatePreferences(body).data.map { it.toModel() }
        }
}

internal fun NotificationPreferenceDto.toModel() = NotificationPreference(category, inApp, push)
