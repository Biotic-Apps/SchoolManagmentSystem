package com.schoolapp.core.data.applock

/** Time since boot; unlike wall-clock time it cannot be moved back to dodge the lock. */
fun interface MonotonicClock {
    fun nowMillis(): Long
}
