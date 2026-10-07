package com.schoolapp.feature.profile.applock

import androidx.compose.runtime.Immutable
import com.schoolapp.core.data.applock.AppLockAvailability

@Immutable
data class AppLockSettingsUiState(
    val enabled: Boolean = false,
    /** Null until the device has been checked. */
    val availability: AppLockAvailability? = null,
    /** Staff accounts see "Recommended"; parents may opt in. */
    val recommended: Boolean = false,
    val isSaving: Boolean = false,
    /** System prompt error (lockout etc.) from the last attempt to turn the lock on. */
    val promptError: String? = null,
) {
    /** Turning off is always possible; turning on needs a usable device lock. */
    val canToggle: Boolean get() = !isSaving && (enabled || availability == AppLockAvailability.AVAILABLE)
}
