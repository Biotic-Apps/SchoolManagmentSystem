package com.schoolapp.applock

import androidx.compose.runtime.Immutable
import com.schoolapp.core.data.applock.AppLockState

@Immutable
data class AppLockUiState(
    val lock: AppLockState = AppLockState.UNKNOWN,
    /** Null while checking; false when the device lock was removed after the app lock was turned on (only sign-out is left). */
    val canUnlock: Boolean? = null,
    /** Last prompt error (lockout etc.), shown under the unlock button. */
    val error: String? = null,
)
