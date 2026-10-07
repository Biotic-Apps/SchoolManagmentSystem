package com.schoolapp.core.data.applock

/** When the app relocks after being in the background (security.md §8). */
object AppLockPolicy {
    const val BACKGROUND_TIMEOUT_MILLIS = 5 * 60 * 1_000L

    /** True when the app was in the background for more than [BACKGROUND_TIMEOUT_MILLIS]. */
    fun expired(backgroundedAtMillis: Long, nowMillis: Long): Boolean =
        nowMillis - backgroundedAtMillis > BACKGROUND_TIMEOUT_MILLIS
}
