package com.schoolapp.core.model.activity

/** `GET /activities` filters; [from]/[to] are `yyyy-MM-dd` (the calendar asks for one month). */
data class ActivityFilter(
    val type: ActivityType? = null,
    val status: ActivityStatus? = null,
    val from: String? = null,
    val to: String? = null,
)
