package com.schoolapp.demo

import com.schoolapp.core.common.result.AppResult
import com.schoolapp.core.data.notifications.DefaultNotificationsRepository
import com.schoolapp.core.data.notifications.NotificationsRepository
import com.schoolapp.core.model.notification.AppNotification
import kotlinx.coroutines.ExperimentalCoroutinesApi
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.flatMapLatest
import kotlinx.coroutines.flow.map
import kotlinx.coroutines.flow.update
import javax.inject.Inject
import javax.inject.Singleton

@Singleton
class DemoAwareNotificationsRepository @Inject constructor(
    private val real: DefaultNotificationsRepository,
    private val auth: DemoAwareAuthRepository,
) : NotificationsRepository {

    private val demoItems = MutableStateFlow(DemoData.notifications)

    @OptIn(ExperimentalCoroutinesApi::class)
    override val unreadCount: Flow<Int> = auth.demoActive.flatMapLatest { demo ->
        if (demo) demoItems.map { list -> list.count { !it.isRead } } else real.unreadCount
    }

    override suspend fun notifications(unreadOnly: Boolean): AppResult<List<AppNotification>> =
        if (auth.isDemoActive) {
            AppResult.Success(demoItems.value.filter { !unreadOnly || !it.isRead })
        } else {
            real.notifications(unreadOnly)
        }

    override suspend fun markRead(id: String): AppResult<Unit> {
        if (!auth.isDemoActive) return real.markRead(id)
        demoItems.update { list -> list.map { if (it.id == id) it.copy(isRead = true) else it } }
        return AppResult.Success(Unit)
    }

    override suspend fun markAllRead(): AppResult<Unit> {
        if (!auth.isDemoActive) return real.markAllRead()
        demoItems.update { list -> list.map { it.copy(isRead = true) } }
        return AppResult.Success(Unit)
    }
}
