package com.schoolapp.core.testing

import com.schoolapp.core.data.applock.AppLockAvailability
import com.schoolapp.core.data.applock.AppLockRepository
import kotlinx.coroutines.flow.MutableStateFlow

class FakeAppLockRepository(
    enabled: Boolean = false,
    var availability: AppLockAvailability = AppLockAvailability.AVAILABLE,
) : AppLockRepository {
    override val enabled = MutableStateFlow(enabled)
    val setCalls = mutableListOf<Boolean>()
    var availabilityChecks = 0

    override suspend fun availability(): AppLockAvailability {
        availabilityChecks++
        return availability
    }

    override suspend fun setEnabled(enabled: Boolean): Boolean {
        setCalls += enabled
        if (enabled && availability != AppLockAvailability.AVAILABLE) return false
        this.enabled.value = enabled
        return true
    }
}
