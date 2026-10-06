package com.schoolapp.core.common.time

import java.time.LocalDateTime

/** Current local date-time; injected so "now"-based logic (current period, today) is testable. */
fun interface AppClock {
    fun now(): LocalDateTime
}
