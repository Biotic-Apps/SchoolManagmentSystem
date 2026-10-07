package com.schoolapp.feature.profile

import com.schoolapp.core.data.applock.AppLockAvailability
import com.schoolapp.core.model.RoleKey
import com.schoolapp.core.testing.FakeAppLockRepository
import com.schoolapp.core.testing.FakeAuthRepository
import com.schoolapp.core.testing.MainDispatcherRule
import com.schoolapp.core.testing.TestSessions
import com.schoolapp.core.ui.unlock.UnlockResult
import com.schoolapp.feature.profile.applock.AppLockSettingsViewModel
import org.junit.Assert.assertEquals
import org.junit.Assert.assertFalse
import org.junit.Assert.assertNull
import org.junit.Assert.assertTrue
import org.junit.Rule
import org.junit.Test

class AppLockSettingsViewModelTest {

    @get:Rule
    val mainDispatcherRule = MainDispatcherRule()

    private val repository = FakeAppLockRepository()
    private val auth = FakeAuthRepository(TestSessions.session(RoleKey.TEACHER))

    private fun viewModel() = AppLockSettingsViewModel(repository, auth)

    @Test
    fun off_by_default_and_recommended_for_staff() {
        val state = viewModel().uiState.value
        assertFalse(state.enabled)
        assertTrue(state.recommended)
        assertEquals(AppLockAvailability.AVAILABLE, state.availability)
        assertTrue(state.canToggle)
    }

    @Test
    fun parents_see_it_without_the_recommendation() {
        auth.sessionState.value = TestSessions.session(RoleKey.PARENT)
        assertFalse(viewModel().uiState.value.recommended)
    }

    @Test
    fun turns_on_only_after_a_successful_prompt() {
        val vm = viewModel()
        vm.onEnableResult(UnlockResult.Cancelled)
        assertTrue(repository.setCalls.isEmpty())
        vm.onEnableResult(UnlockResult.Success)
        assertEquals(listOf(true), repository.setCalls)
        assertTrue(vm.uiState.value.enabled)
        assertFalse(vm.uiState.value.isSaving)
    }

    @Test
    fun prompt_error_is_shown_and_nothing_saved() {
        val vm = viewModel()
        vm.onEnableResult(UnlockResult.Error("Too many attempts"))
        assertEquals("Too many attempts", vm.uiState.value.promptError)
        assertTrue(repository.setCalls.isEmpty())
        vm.onEnableResult(UnlockResult.Cancelled)
        assertNull(vm.uiState.value.promptError)
    }

    @Test
    fun no_device_lock_disables_turning_on_but_not_off() {
        repository.availability = AppLockAvailability.NO_DEVICE_LOCK
        val vm = viewModel()
        assertFalse(vm.uiState.value.canToggle)
        repository.enabled.value = true
        assertTrue(vm.uiState.value.canToggle)
        vm.onDisable()
        assertFalse(vm.uiState.value.enabled)
    }

    @Test
    fun availability_is_rechecked_on_resume() {
        repository.availability = AppLockAvailability.NO_DEVICE_LOCK
        val vm = viewModel()
        repository.availability = AppLockAvailability.AVAILABLE
        vm.refreshAvailability()
        assertEquals(AppLockAvailability.AVAILABLE, vm.uiState.value.availability)
        assertTrue(vm.uiState.value.canToggle)
    }
}
