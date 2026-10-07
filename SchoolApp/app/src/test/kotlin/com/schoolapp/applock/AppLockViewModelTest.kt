package com.schoolapp.applock

import com.schoolapp.core.data.applock.AppLockAvailability
import com.schoolapp.core.data.applock.AppLockController
import com.schoolapp.core.data.applock.AppLockState
import com.schoolapp.core.model.RoleKey
import com.schoolapp.core.testing.FakeAppLockRepository
import com.schoolapp.core.testing.FakeAuthRepository
import com.schoolapp.core.testing.MainDispatcherRule
import com.schoolapp.core.testing.TestSessions
import com.schoolapp.core.ui.unlock.UnlockResult
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.SupervisorJob
import kotlinx.coroutines.cancel
import org.junit.After
import org.junit.Assert.assertEquals
import org.junit.Assert.assertNull
import org.junit.Rule
import org.junit.Test

class AppLockViewModelTest {

    @get:Rule
    val mainDispatcherRule = MainDispatcherRule()

    private val scope = CoroutineScope(SupervisorJob() + mainDispatcherRule.dispatcher)
    private val auth = FakeAuthRepository(TestSessions.session(RoleKey.PRINCIPAL))
    private val repository = FakeAppLockRepository(enabled = true)
    private val controller = AppLockController(repository, auth, { 0L }, scope)

    @After
    fun tearDown() = scope.cancel()

    @Test
    fun locked_with_a_usable_device_lock_can_unlock() {
        val state = AppLockViewModel(controller, repository).uiState.value
        assertEquals(AppLockState.LOCKED, state.lock)
        assertEquals(true, state.canUnlock)
    }

    @Test
    fun removed_device_lock_leaves_only_sign_out() {
        repository.availability = AppLockAvailability.NO_DEVICE_LOCK
        assertEquals(false, AppLockViewModel(controller, repository).uiState.value.canUnlock)
    }

    @Test
    fun successful_prompt_unlocks() {
        val vm = AppLockViewModel(controller, repository)
        vm.onUnlockResult(UnlockResult.Success)
        assertEquals(AppLockState.UNLOCKED, vm.uiState.value.lock)
    }

    @Test
    fun prompt_error_is_shown_and_cancel_clears_it() {
        val vm = AppLockViewModel(controller, repository)
        vm.onUnlockResult(UnlockResult.Error("Too many attempts"))
        assertEquals("Too many attempts", vm.uiState.value.error)
        assertEquals(AppLockState.LOCKED, vm.uiState.value.lock)
        vm.onUnlockResult(UnlockResult.Cancelled)
        assertNull(vm.uiState.value.error)
    }

    @Test
    fun sign_out_while_locked_unlocks() {
        val vm = AppLockViewModel(controller, repository)
        auth.sessionState.value = null
        assertEquals(AppLockState.UNLOCKED, vm.uiState.value.lock)
    }
}
