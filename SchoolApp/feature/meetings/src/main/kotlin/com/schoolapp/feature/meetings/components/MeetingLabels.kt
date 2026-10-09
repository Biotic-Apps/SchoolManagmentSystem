package com.schoolapp.feature.meetings.components

import androidx.annotation.StringRes
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.outlined.Call
import androidx.compose.material.icons.outlined.Groups
import androidx.compose.material.icons.outlined.Videocam
import androidx.compose.ui.graphics.vector.ImageVector
import com.schoolapp.core.common.time.TimeFormat
import com.schoolapp.core.designsystem.component.StatusTone
import com.schoolapp.core.model.meeting.MeetingMode
import com.schoolapp.core.model.meeting.MeetingStatus
import com.schoolapp.feature.meetings.R

@StringRes
internal fun MeetingMode.labelRes(): Int = when (this) {
    MeetingMode.IN_PERSON -> R.string.meetings_mode_in_person
    MeetingMode.PHONE -> R.string.meetings_mode_phone
    MeetingMode.VIDEO -> R.string.meetings_mode_video
}

internal fun MeetingMode.icon(): ImageVector = when (this) {
    MeetingMode.IN_PERSON -> Icons.Outlined.Groups
    MeetingMode.PHONE -> Icons.Outlined.Call
    MeetingMode.VIDEO -> Icons.Outlined.Videocam
}

@StringRes
internal fun MeetingStatus.labelRes(): Int = when (this) {
    MeetingStatus.REQUESTED -> R.string.meetings_status_requested
    MeetingStatus.SCHEDULED -> R.string.meetings_status_scheduled
    MeetingStatus.COMPLETED -> R.string.meetings_status_completed
    MeetingStatus.CANCELLED -> R.string.meetings_status_cancelled
    MeetingStatus.NO_SHOW -> R.string.meetings_status_no_show
}

internal fun MeetingStatus.tone(): StatusTone = when (this) {
    MeetingStatus.REQUESTED -> StatusTone.Warning
    MeetingStatus.SCHEDULED -> StatusTone.Info
    MeetingStatus.COMPLETED -> StatusTone.Success
    MeetingStatus.CANCELLED -> StatusTone.Neutral
    MeetingStatus.NO_SHOW -> StatusTone.Error
}

/** API `HH:mm` pair -> "9:00 AM – 9:20 AM". */
internal fun timeRange12(start: String, end: String): String = "${TimeFormat.formatTime12(start)} – ${TimeFormat.formatTime12(end)}"
