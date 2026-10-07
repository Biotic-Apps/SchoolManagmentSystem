package com.schoolapp.core.data.applock

import com.schoolapp.core.datastore.applock.AppLockPreferences
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.first
import kotlinx.coroutines.test.runTest
import org.junit.Assert.assertEquals
import org.junit.Assert.assertFalse
import org.junit.Assert.assertTrue
import org.junit.Test

class DefaultAppLockRepositoryTest {

    private val preferences = FakePreferences()
    private var availability = AppLockAvailability.AVAILABLE
    private val repository = DefaultAppLockRepository(preferences) { availability }

    @Test
    fun off_by_default() = runTest {
        assertFalse(repository.enabled.first())
    }

    @Test
    fun turns_on_when_the_device_has_a_lock() = runTest {
        assertTrue(repository.setEnabled(true))
        assertTrue(repository.enabled.first())
    }

    @Test
    fun refuses_to_turn_on_without_a_device_lock() = runTest {
        availability = AppLockAvailability.NO_DEVICE_LOCK
        assertFalse(repository.setEnabled(true))
        assertFalse(repository.enabled.first())
        assertEquals(AppLockAvailability.NO_DEVICE_LOCK, repository.availability())
    }

    @Test
    fun turning_off_always_works() = runTest {
        repository.setEnabled(true)
        availability = AppLockAvailability.UNSUPPORTED
        assertTrue(repository.setEnabled(false))
        assertFalse(repository.enabled.first())
    }

    private class FakePreferences : AppLockPreferences {
        override val enabled = MutableStateFlow(false)

        override suspend fun setEnabled(enabled: Boolean) {
            this.enabled.value = enabled
        }
    }
}
