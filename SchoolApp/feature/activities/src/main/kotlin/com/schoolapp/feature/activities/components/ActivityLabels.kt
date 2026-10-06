package com.schoolapp.feature.activities.components

import androidx.annotation.StringRes
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.outlined.DirectionsBus
import androidx.compose.material.icons.outlined.EmojiEvents
import androidx.compose.material.icons.outlined.Event
import androidx.compose.material.icons.outlined.Groups
import androidx.compose.material.icons.outlined.SportsSoccer
import androidx.compose.ui.graphics.vector.ImageVector
import com.schoolapp.core.designsystem.component.StatusTone
import com.schoolapp.core.model.activity.ActivityStatus
import com.schoolapp.core.model.activity.ActivityType
import com.schoolapp.core.model.activity.ConsentStatus
import com.schoolapp.feature.activities.R

internal fun ActivityType.icon(): ImageVector = when (this) {
    ActivityType.EVENT -> Icons.Outlined.Event
    ActivityType.SPORTS -> Icons.Outlined.SportsSoccer
    ActivityType.TRIP -> Icons.Outlined.DirectionsBus
    ActivityType.COMPETITION -> Icons.Outlined.EmojiEvents
    ActivityType.CLUB -> Icons.Outlined.Groups
}

@StringRes
internal fun ActivityType.labelRes(): Int = when (this) {
    ActivityType.EVENT -> R.string.activities_type_event
    ActivityType.SPORTS -> R.string.activities_type_sports
    ActivityType.TRIP -> R.string.activities_type_trip
    ActivityType.COMPETITION -> R.string.activities_type_competition
    ActivityType.CLUB -> R.string.activities_type_club
}

@StringRes
internal fun ActivityStatus.labelRes(): Int = when (this) {
    ActivityStatus.PROPOSED -> R.string.activities_status_proposed
    ActivityStatus.APPROVED -> R.string.activities_status_approved
    ActivityStatus.REJECTED -> R.string.activities_status_rejected
    ActivityStatus.ANNOUNCED -> R.string.activities_status_announced
    ActivityStatus.ONGOING -> R.string.activities_status_ongoing
    ActivityStatus.COMPLETED -> R.string.activities_status_completed
    ActivityStatus.CANCELLED -> R.string.activities_status_cancelled
}

internal fun ActivityStatus.tone(): StatusTone = when (this) {
    ActivityStatus.PROPOSED -> StatusTone.Warning
    ActivityStatus.APPROVED, ActivityStatus.ANNOUNCED -> StatusTone.Info
    ActivityStatus.ONGOING, ActivityStatus.COMPLETED -> StatusTone.Success
    ActivityStatus.REJECTED, ActivityStatus.CANCELLED -> StatusTone.Error
}

@StringRes
internal fun ConsentStatus.labelRes(): Int = when (this) {
    ConsentStatus.PENDING -> R.string.activities_consent_pending
    ConsentStatus.GRANTED -> R.string.activities_consent_granted
    ConsentStatus.DECLINED -> R.string.activities_consent_declined
}

internal fun ConsentStatus.tone(): StatusTone = when (this) {
    ConsentStatus.PENDING -> StatusTone.Warning
    ConsentStatus.GRANTED -> StatusTone.Success
    ConsentStatus.DECLINED -> StatusTone.Error
}
