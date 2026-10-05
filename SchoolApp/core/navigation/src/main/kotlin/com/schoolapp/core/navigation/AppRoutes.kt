package com.schoolapp.core.navigation

import kotlinx.serialization.Serializable

@Serializable
data object LoginDestination

@Serializable
data object ShellDestination

/** Shown instead of the shell while the server requires a new password. */
@Serializable
data object ForcedPasswordChangeDestination

@Serializable
data class MenuDestination(val menuId: String)

/** Opened from the shell's top bar bell; registered by :feature:notifications. */
@Serializable
data object NotificationsDestination
