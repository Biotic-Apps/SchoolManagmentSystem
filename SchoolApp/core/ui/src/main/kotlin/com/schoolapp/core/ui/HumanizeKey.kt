package com.schoolapp.core.ui

/** `PROBATION_REVIEW` / `activeSessions` / `attendance.lockTime` -> readable words. */
fun humanizeKey(key: String): String {
    val spaced = key
        .replace('.', ' ')
        .replace('_', ' ')
        .replace(Regex("([a-z])([A-Z])"), "$1 $2")
        .trim()
        .lowercase()
    return spaced.replaceFirstChar { it.uppercase() }
}
