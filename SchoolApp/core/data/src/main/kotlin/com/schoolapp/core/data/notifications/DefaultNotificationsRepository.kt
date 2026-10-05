package com.schoolapp.core.data.notifications

import com.schoolapp.core.common.dispatcher.IoDispatcher
import com.schoolapp.core.common.result.AppResult
import com.schoolapp.core.model.notification.AppNotification
import com.schoolapp.core.network.ApiCaller
import com.schoolapp.core.network.api.NotificationsApi
import com.schoolapp.core.network.dto.notification.NotificationDto
import kotlinx.coroutines.CoroutineDispatcher
import kotlinx.coroutines.ExperimentalCoroutinesApi
import kotlinx.coroutines.delay
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.MutableSharedFlow
import kotlinx.coroutines.flow.distinctUntilChanged
import kotlinx.coroutines.flow.flow
import kotlinx.coroutines.flow.flowOn
import kotlinx.coroutines.flow.mapLatest
import kotlinx.coroutines.flow.merge
import kotlinx.coroutines.flow.filterNotNull
import javax.inject.Inject
import javax.inject.Singleton

@Singleton
class DefaultNotificationsRepository @Inject constructor(
    private val api: NotificationsApi,
    private val apiCaller: ApiCaller,
    @IoDispatcher private val io: CoroutineDispatcher,
) : NotificationsRepository {

    private val refreshSignal = MutableSharedFlow<Unit>(extraBufferCapacity = 1)

    private val ticker: Flow<Unit> = flow {
        while (true) {
            emit(Unit)
            delay(POLL_INTERVAL_MS)
        }
    }

    @OptIn(ExperimentalCoroutinesApi::class)
    override val unreadCount: Flow<Int> = merge(ticker, refreshSignal)
        .mapLatest { (apiCaller.call { api.unreadCount().data.count } as? AppResult.Success)?.data }
        .filterNotNull()
        .distinctUntilChanged()
        .flowOn(io)

    override suspend fun notifications(unreadOnly: Boolean): AppResult<List<AppNotification>> =
        apiCaller.call { api.list(unread = unreadOnly.takeIf { it }).data.map { it.toModel() } }

    override suspend fun markRead(id: String): AppResult<Unit> =
        apiCaller.call { api.markRead(id) }.also { refreshSignal.tryEmit(Unit) }

    override suspend fun markAllRead(): AppResult<Unit> =
        apiCaller.call { api.markAllRead() }.also { refreshSignal.tryEmit(Unit) }

    private fun NotificationDto.toModel() =
        AppNotification(id, category, title, body, isRead = readAt != null, createdAt = createdAt)

    private companion object {
        const val POLL_INTERVAL_MS = 60_000L
    }
}
