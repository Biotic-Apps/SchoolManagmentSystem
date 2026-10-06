package com.schoolapp.feature.profile.notifications.components

import com.schoolapp.feature.profile.R

/** Friendly label and one-line description of a notification category; null for categories added later. */
internal data class CategoryText(val labelRes: Int, val descriptionRes: Int)

internal fun categoryText(category: String): CategoryText? = when (category) {
    "ATTENDANCE" -> CategoryText(R.string.notifications_attendance, R.string.notifications_attendance_hint)
    "DIARY" -> CategoryText(R.string.notifications_diary, R.string.notifications_diary_hint)
    "ACTIVITY" -> CategoryText(R.string.notifications_activity, R.string.notifications_activity_hint)
    "CONSENT" -> CategoryText(R.string.notifications_consent, R.string.notifications_consent_hint)
    "NOTICE" -> CategoryText(R.string.notifications_notice, R.string.notifications_notice_hint)
    "MESSAGE" -> CategoryText(R.string.notifications_message, R.string.notifications_message_hint)
    "COMPLAINT" -> CategoryText(R.string.notifications_complaint, R.string.notifications_complaint_hint)
    "MEETING" -> CategoryText(R.string.notifications_meeting, R.string.notifications_meeting_hint)
    "HEALTH" -> CategoryText(R.string.notifications_health, R.string.notifications_health_hint)
    "PICKUP" -> CategoryText(R.string.notifications_pickup, R.string.notifications_pickup_hint)
    "LEAVE" -> CategoryText(R.string.notifications_leave, R.string.notifications_leave_hint)
    "APPROVAL" -> CategoryText(R.string.notifications_approval, R.string.notifications_approval_hint)
    else -> null
}
