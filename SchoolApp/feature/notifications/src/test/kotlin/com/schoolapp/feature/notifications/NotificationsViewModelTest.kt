package com.schoolapp.feature.notifications

import com.schoolapp.core.common.result.AppError
import com.schoolapp.core.common.result.AppResult
import com.schoolapp.core.data.notifications.NotificationsRepository
import com.schoolapp.core.model.notification.AppNotification
import com.schoolapp.core.testing.MainDispatcherRule
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.flowOf
import org.junit.Assert.assertEquals
import org.junit.Assert.assertFalse
import org.junit.Assert.assertNull
import org.junit.Rule
import org.junit.Test

class NotificationsViewModelTest {

    @get:Rule
    val mainDispatcherRule = MainDispatcherRule()

    private class FakeRepository : NotificationsRepository {
        var result: AppResult<List<AppNotification>> = AppResult.Success(emptyList())
        var calls = 0
        override val unreadCount: Flow<Int> = flowOf(0)
        override suspend fun notifications(unreadOnly: Boolean): AppResult<List<AppNotification>> {
            calls++
            return result
        }
        override suspend fun markRead(id: String): AppResult<Unit> = AppResult.Success(Unit)
        override suspend fun markAllRead(): AppResult<Unit> = AppResult.Success(Unit)
    }

    private fun item(id: String) = AppNotification(id, "fees", "Title $id", null, isRead = false, createdAt = null)

    @Test
    fun quiet_reload_picks_up_new_items_without_a_spinner() {
        val repository = FakeRepository().apply { result = AppResult.Success(listOf(item("1"))) }
        val vm = NotificationsViewModel(repository)
        repository.result = AppResult.Success(listOf(item("2"), item("1")))
        vm.reloadQuietly()
        val state = vm.uiState.value
        assertEquals(2, repository.calls)
        assertEquals(listOf("2", "1"), state.items.map { it.id })
        assertFalse(state.isLoading)
        assertFalse(state.isRefreshing)
    }

    @Test
    fun quiet_reload_failure_keeps_the_list_and_shows_no_error() {
        val repository = FakeRepository().apply { result = AppResult.Success(listOf(item("1"))) }
        val vm = NotificationsViewModel(repository)
        repository.result = AppResult.Failure(AppError.Network)
        vm.reloadQuietly()
        assertEquals(listOf("1"), vm.uiState.value.items.map { it.id })
        assertNull(vm.uiState.value.error)
    }
}
