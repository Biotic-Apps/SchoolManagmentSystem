package com.schoolapp.core.data.applock

import com.schoolapp.core.model.RoleKey
import com.schoolapp.core.testing.FakeAppLockRepository
import com.schoolapp.core.testing.FakeAuthRepository
import com.schoolapp.core.testing.TestSessions
import kotlinx.coroutines.ExperimentalCoroutinesApi
import kotlinx.coroutines.test.TestScope
import kotlinx.coroutines.test.UnconfinedTestDispatcher
import kotlinx.coroutines.test.runTest
import org.junit.Assert.assertEquals
import org.junit.Test

@OptIn(ExperimentalCoroutinesApi::class)
class AppLockControllerTest {

    private val auth = FakeAuthRepository(TestSessions.session(RoleKey.TEACHER))
    private var now = 1_000_000L

    private fun TestScope.controller(enabled: Boolean): Pair<AppLockController, FakeAppLockRepository> {
        val repository = FakeAppLockRepository(enabled = enabled)
        return AppLockController(repository, auth, { now }, backgroundScope) to repository
    }

    private fun AppLockController.awayFor(millis: Long) {
        onBackground()
        now += millis
        onForeground()
    }

    @Test
    fun cold_start_locks_when_enabled_and_signed_in() = runTest(UnconfinedTestDispatcher()) {
        val (controller, _) = controller(enabled = true)
        assertEquals(AppLockState.LOCKED, controller.state.value)
        controller.unlock()
        assertEquals(AppLockState.UNLOCKED, controller.state.value)
    }

    @Test
    fun cold_start_is_unlocked_when_lock_is_off() = runTest(UnconfinedTestDispatcher()) {
        val (controller, _) = controller(enabled = false)
        assertEquals(AppLockState.UNLOCKED, controller.state.value)
    }

    @Test
    fun turning_the_lock_on_does_not_lock_at_once() = runTest(UnconfinedTestDispatcher()) {
        val (controller, repository) = controller(enabled = false)
        repository.setEnabled(true)
        assertEquals(AppLockState.UNLOCKED, controller.state.value)
    }

    @Test
    fun relocks_only_after_more_than_five_minutes_away() = runTest(UnconfinedTestDispatcher()) {
        val (controller, _) = controller(enabled = true)
        controller.unlock()
        controller.awayFor(AppLockPolicy.BACKGROUND_TIMEOUT_MILLIS)
        assertEquals(AppLockState.UNLOCKED, controller.state.value)
        controller.awayFor(AppLockPolicy.BACKGROUND_TIMEOUT_MILLIS + 1)
        assertEquals(AppLockState.LOCKED, controller.state.value)
    }

    @Test
    fun foreground_without_background_does_nothing() = runTest(UnconfinedTestDispatcher()) {
        val (controller, _) = controller(enabled = true)
        controller.unlock()
        now += AppLockPolicy.BACKGROUND_TIMEOUT_MILLIS * 2
        controller.onForeground()
        assertEquals(AppLockState.UNLOCKED, controller.state.value)
    }

    @Test
    fun signing_out_always_unlocks() = runTest(UnconfinedTestDispatcher()) {
        val (controller, _) = controller(enabled = true)
        assertEquals(AppLockState.LOCKED, controller.state.value)
        auth.logout()
        assertEquals(AppLockState.UNLOCKED, controller.state.value)
        auth.sessionState.value = TestSessions.session(RoleKey.TEACHER)
        assertEquals(AppLockState.UNLOCKED, controller.state.value)
    }

    @Test
    fun signed_out_app_never_locks() = runTest(UnconfinedTestDispatcher()) {
        auth.sessionState.value = null
        val (controller, _) = controller(enabled = true)
        controller.awayFor(AppLockPolicy.BACKGROUND_TIMEOUT_MILLIS * 2)
        assertEquals(AppLockState.UNLOCKED, controller.state.value)
    }

    @Test
    fun turning_the_lock_off_unlocks() = runTest(UnconfinedTestDispatcher()) {
        val (controller, repository) = controller(enabled = true)
        repository.setEnabled(false)
        assertEquals(AppLockState.UNLOCKED, controller.state.value)
    }
}
