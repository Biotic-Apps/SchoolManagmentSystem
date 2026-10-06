package com.schoolapp.feature.dashboard.components

import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.outlined.KeyboardArrowRight
import androidx.compose.material.icons.outlined.EventAvailable
import androidx.compose.material.icons.outlined.HowToReg
import androidx.compose.material3.Icon
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.res.pluralStringResource
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.unit.dp
import com.schoolapp.core.designsystem.component.AppCard
import com.schoolapp.core.designsystem.component.ListItemRow
import com.schoolapp.core.designsystem.component.StatusChip
import com.schoolapp.core.designsystem.component.StatusTone
import com.schoolapp.core.designsystem.theme.AppColors
import com.schoolapp.core.model.meeting.Meeting
import com.schoolapp.core.ui.formatDate
import com.schoolapp.core.ui.formatTime
import com.schoolapp.feature.dashboard.R

/** Activity consents waiting for the parent; opens the activities list. */
@Composable
internal fun ConsentsCard(pending: Int, onOpen: () -> Unit, modifier: Modifier = Modifier) {
    AppCard(modifier.fillMaxWidth(), contentPadding = 0.dp) {
        ListItemRow(
            title = stringResource(R.string.dashboard_consents_title),
            supporting = if (pending > 0) {
                pluralStringResource(R.plurals.dashboard_consents_pending, pending, pending)
            } else {
                stringResource(R.string.dashboard_consents_none)
            },
            leadingIcon = Icons.Outlined.HowToReg,
            onClick = onOpen,
            trailing = {
                if (pending > 0) StatusChip(pending.toString(), StatusTone.Warning) else Chevron()
            },
        )
    }
}

/** Next scheduled meeting (date, 12-hour time, teacher); [onOpen] null when the role has no meetings menu. */
@Composable
internal fun NextMeetingCard(meeting: Meeting?, onOpen: (() -> Unit)?, modifier: Modifier = Modifier) {
    AppCard(modifier.fillMaxWidth(), contentPadding = 0.dp) {
        ListItemRow(
            title = stringResource(R.string.dashboard_next_meeting_title),
            supporting = meeting?.let {
                val time = listOfNotNull(formatDate(it.date), formatTime(it.startTime)).joinToString(", ")
                it.staff?.name?.let { teacher -> stringResource(R.string.dashboard_meeting_with, time, teacher) } ?: time
            } ?: stringResource(R.string.dashboard_next_meeting_none),
            leadingIcon = Icons.Outlined.EventAvailable,
            onClick = onOpen,
            trailing = if (onOpen != null) { { Chevron() } } else null,
        )
    }
}

@Composable
private fun Chevron() =
    Icon(Icons.AutoMirrored.Outlined.KeyboardArrowRight, contentDescription = null, tint = AppColors.TextSecondary)
