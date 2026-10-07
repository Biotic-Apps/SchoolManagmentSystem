package com.schoolapp.core.data.applock

enum class AppLockState {
    /** Stored setting and session not read yet (first moments of a cold start). */
    UNKNOWN,
    UNLOCKED,
    LOCKED,
}
