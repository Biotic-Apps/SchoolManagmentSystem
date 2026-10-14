package com.schoolapp.feature.settings.notifications

import androidx.compose.runtime.Composable
import androidx.compose.ui.res.stringResource
import com.schoolapp.core.ui.humanizeKey
import com.schoolapp.feature.settings.R

internal data class CategoryLabel(val title: String, val hint: String?)

/** Known notification categories with a hint (same as Profile › Notifications); others are humanized. */
@Composable
internal fun categoryLabel(category: String): CategoryLabel {
    val ids = KNOWN[category] ?: return CategoryLabel(humanizeKey(category), null)
    return CategoryLabel(stringResource(ids.first), stringResource(ids.second))
}

private val KNOWN: Map<String, Pair<Int, Int>> = mapOf(
    "ATTENDANCE" to (R.string.settings_notifications_cat_attendance to R.string.settings_notifications_cat_attendance_hint),
    "DIARY" to (R.string.settings_notifications_cat_diary to R.string.settings_notifications_cat_diary_hint),
    "ACTIVITY" to (R.string.settings_notifications_cat_activity to R.string.settings_notifications_cat_activity_hint),
    "CONSENT" to (R.string.settings_notifications_cat_consent to R.string.settings_notifications_cat_consent_hint),
    "NOTICE" to (R.string.settings_notifications_cat_notice to R.string.settings_notifications_cat_notice_hint),
    "MESSAGE" to (R.string.settings_notifications_cat_message to R.string.settings_notifications_cat_message_hint),
    "COMPLAINT" to (R.string.settings_notifications_cat_complaint to R.string.settings_notifications_cat_complaint_hint),
    "MEETING" to (R.string.settings_notifications_cat_meeting to R.string.settings_notifications_cat_meeting_hint),
    "HEALTH" to (R.string.settings_notifications_cat_health to R.string.settings_notifications_cat_health_hint),
    "PICKUP" to (R.string.settings_notifications_cat_pickup to R.string.settings_notifications_cat_pickup_hint),
    "LEAVE" to (R.string.settings_notifications_cat_leave to R.string.settings_notifications_cat_leave_hint),
    "APPROVAL" to (R.string.settings_notifications_cat_approval to R.string.settings_notifications_cat_approval_hint),
)
