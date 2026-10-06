package com.schoolapp.core.model.notification

/** One category of `/notifications/preferences`; HEALTH and PICKUP are critical and cannot be muted. */
data class NotificationPreference(val category: String, val inApp: Boolean, val push: Boolean) {
    val isCritical: Boolean get() = category in CRITICAL

    companion object {
        val CRITICAL = setOf("HEALTH", "PICKUP")
    }
}
