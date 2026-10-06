package com.schoolapp.core.model.activity

/** Teacher proposal (`POST /activities`); [startAt]/[endAt] are ISO local date-times `yyyy-MM-ddTHH:mm`. */
data class ActivityInput(
    val branchId: String?,
    val type: ActivityType,
    val title: String,
    val description: String,
    val startAt: String,
    val endAt: String,
    val venue: String?,
    val sectionIds: List<String>,
    val wholeBranch: Boolean,
    val consentRequired: Boolean,
    val consentDeadline: String?,
)
