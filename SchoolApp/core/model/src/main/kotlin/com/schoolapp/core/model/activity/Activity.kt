package com.schoolapp.core.model.activity

enum class ActivityType { EVENT, SPORTS, TRIP, COMPETITION, CLUB }

enum class ActivityStatus { PROPOSED, APPROVED, REJECTED, ANNOUNCED, ONGOING, COMPLETED, CANCELLED }

enum class ConsentStatus { PENDING, GRANTED, DECLINED }

/** [startAt]/[endAt] are ISO timestamps; [consentDeadline] is a date or timestamp. */
data class Activity(
    val id: String,
    val type: ActivityType,
    val title: String,
    val description: String?,
    val startAt: String,
    val endAt: String?,
    val venue: String?,
    val status: ActivityStatus,
    val consentRequired: Boolean,
    val consentDeadline: String?,
    val feeMinor: Long?,
    val maxParticipants: Int?,
    val audienceLabel: String?,
    val proposedBy: String?,
    /** Parent view (`/activities/mine`): the child's consent, null when not asked. */
    val myConsent: ConsentStatus? = null,
    val studentId: String? = null,
)
