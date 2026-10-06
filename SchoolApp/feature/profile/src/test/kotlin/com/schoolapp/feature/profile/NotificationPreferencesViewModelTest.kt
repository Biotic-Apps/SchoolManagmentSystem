package com.schoolapp.feature.profile

import com.schoolapp.core.common.result.AppError
import com.schoolapp.core.common.result.AppResult
import com.schoolapp.core.data.notifications.NotificationPreferencesRepository
import com.schoolapp.core.model.notification.NotificationPreference
import com.schoolapp.core.testing.MainDispatcherRule
import com.schoolapp.feature.profile.notifications.NotificationPreferencesViewModel
import org.junit.Assert.assertEquals
import org.junit.Assert.assertFalse
import org.junit.Assert.assertNull
import org.junit.Assert.assertTrue
import org.junit.Rule
import org.junit.Test

class NotificationPreferencesViewModelTest {

    @get:Rule
    val mainDispatcherRule = MainDispatcherRule()

    private val repository = FakePreferencesRepository(
        listOf(
            NotificationPreference("NOTICE", inApp = true, push = true),
            NotificationPreference("HEALTH", inApp = true, push = false),
            NotificationPreference("ATTENDANCE", inApp = false, push = true),
            NotificationPreference("PICKUP", inApp = true, push = true),
        ),
    )

    private fun push(vm: NotificationPreferencesViewModel, category: String) =
        vm.uiState.value.items.first { it.category == category }.push

    @Test
    fun loads_in_known_order_with_in_app_and_critical_push_forced_on() {
        val items = NotificationPreferencesViewModel(repository).uiState.value.items
        assertEquals(listOf("ATTENDANCE", "NOTICE", "HEALTH", "PICKUP"), items.map { it.category })
        assertTrue(items.all { it.inApp })
        assertTrue(items.first { it.category == "HEALTH" }.push)
    }

    @Test
    fun critical_categories_cannot_be_turned_off() {
        val vm = NotificationPreferencesViewModel(repository)
        vm.onPushChange("HEALTH", false)
        vm.onPushChange("PICKUP", false)
        assertTrue(push(vm, "HEALTH"))
        assertTrue(push(vm, "PICKUP"))
        assertTrue(repository.updates.isEmpty())
    }

    @Test
    fun toggle_saves_the_full_list() {
        val vm = NotificationPreferencesViewModel(repository)
        vm.onPushChange("NOTICE", false)
        assertFalse(push(vm, "NOTICE"))
        val sent = repository.updates.single()
        assertFalse(sent.first { it.category == "NOTICE" }.push)
        assertTrue(sent.first { it.category == "HEALTH" }.push)
        assertTrue(vm.uiState.value.saving.isEmpty())
        assertNull(vm.uiState.value.saveError)
    }

    @Test
    fun failed_save_rolls_back_and_shows_the_error() {
        val vm = NotificationPreferencesViewModel(repository)
        repository.nextError = AppError.Network
        vm.onPushChange("NOTICE", false)
        assertTrue(push(vm, "NOTICE"))
        assertEquals(AppError.Network, vm.uiState.value.saveError)
        assertTrue(vm.uiState.value.saving.isEmpty())
    }

    private class FakePreferencesRepository(private var stored: List<NotificationPreference>) : NotificationPreferencesRepository {
        val updates = mutableListOf<List<NotificationPreference>>()
        var nextError: AppError? = null

        override suspend fun preferences(): AppResult<List<NotificationPreference>> = AppResult.Success(stored)

        override suspend fun update(preferences: List<NotificationPreference>): AppResult<List<NotificationPreference>> {
            updates += preferences
            nextError?.let { return AppResult.Failure(it) }
            stored = preferences
            return AppResult.Success(preferences)
        }
    }
}
