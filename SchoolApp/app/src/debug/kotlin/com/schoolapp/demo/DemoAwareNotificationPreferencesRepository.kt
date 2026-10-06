package com.schoolapp.demo

import com.schoolapp.core.common.result.AppResult
import com.schoolapp.core.data.notifications.DefaultNotificationPreferencesRepository
import com.schoolapp.core.data.notifications.NotificationPreferencesRepository
import com.schoolapp.core.model.notification.NotificationPreference
import kotlinx.coroutines.flow.MutableStateFlow
import javax.inject.Inject
import javax.inject.Singleton

@Singleton
class DemoAwareNotificationPreferencesRepository @Inject constructor(
    private val real: DefaultNotificationPreferencesRepository,
    private val auth: DemoAwareAuthRepository,
) : NotificationPreferencesRepository {

    private val demoPreferences = MutableStateFlow(
        CATEGORIES.map { NotificationPreference(it, inApp = true, push = it != "NOTICE") },
    )

    override suspend fun preferences(): AppResult<List<NotificationPreference>> =
        if (auth.isDemoActive) AppResult.Success(demoPreferences.value) else real.preferences()

    /** Critical categories always keep push on, like the server. */
    override suspend fun update(preferences: List<NotificationPreference>): AppResult<List<NotificationPreference>> {
        if (!auth.isDemoActive) return real.update(preferences)
        val byCategory = preferences.associateBy { it.category }
        demoPreferences.value = demoPreferences.value.map { current ->
            val wanted = byCategory[current.category] ?: current
            if (current.isCritical) current.copy(inApp = true, push = true) else wanted.copy(inApp = true)
        }
        return AppResult.Success(demoPreferences.value)
    }

    private companion object {
        val CATEGORIES = listOf(
            "ATTENDANCE", "DIARY", "ACTIVITY", "CONSENT", "NOTICE", "MESSAGE", "COMPLAINT", "MEETING", "HEALTH", "PICKUP", "LEAVE", "APPROVAL",
        )
    }
}
