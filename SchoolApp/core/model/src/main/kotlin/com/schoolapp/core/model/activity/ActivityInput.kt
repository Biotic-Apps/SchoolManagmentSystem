package com.schoolapp.core.model.activity

/**
 * Proposal (`POST /activities`) or edit of a PROPOSED activity (`PATCH /activities/{id}`).
 * [startAt]/[endAt] are ISO local date-times `yyyy-MM-ddTHH:mm` in school (device) time; [feeMinor] is in paisa.
 */
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
    val classIds: List<String> = emptyList(),
    val feeMinor: Long? = null,
    val maxParticipants: Int? = null,
)
