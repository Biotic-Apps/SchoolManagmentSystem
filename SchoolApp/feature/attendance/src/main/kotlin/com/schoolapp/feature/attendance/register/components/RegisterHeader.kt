package com.schoolapp.feature.attendance.register.components

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.outlined.DoneAll
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.unit.dp
import com.schoolapp.core.designsystem.component.AppCard
import com.schoolapp.core.designsystem.component.SecondaryButton
import com.schoolapp.core.designsystem.component.StatusTone
import com.schoolapp.core.model.attendance.AttendanceStatus
import com.schoolapp.feature.attendance.R
import com.schoolapp.feature.attendance.components.CountItem
import com.schoolapp.feature.attendance.components.CountsGrid
import com.schoolapp.feature.attendance.components.attendanceStatusLabel
import com.schoolapp.feature.attendance.register.RegisterCounts

/** Live counts and, while editable, the "Mark all present" shortcut. */
@Composable
internal fun RegisterHeader(
    counts: RegisterCounts,
    editable: Boolean,
    onMarkAllPresent: () -> Unit,
    modifier: Modifier = Modifier,
) {
    AppCard(modifier, contentPadding = 12.dp) {
        Column(verticalArrangement = Arrangement.spacedBy(12.dp)) {
            CountsGrid(
                listOf(
                    CountItem(attendanceStatusLabel(AttendanceStatus.PRESENT), counts.present, StatusTone.Success),
                    CountItem(attendanceStatusLabel(AttendanceStatus.ABSENT), counts.absent, StatusTone.Error),
                    CountItem(attendanceStatusLabel(AttendanceStatus.LATE), counts.late, StatusTone.Warning),
                    CountItem(attendanceStatusLabel(AttendanceStatus.LEAVE), counts.leave, StatusTone.Info),
                    CountItem(attendanceStatusLabel(AttendanceStatus.HALF_DAY), counts.halfDay, StatusTone.Info),
                    CountItem(attendanceStatusLabel(null), counts.unmarked, StatusTone.Neutral),
                ),
            )
            if (editable) {
                SecondaryButton(
                    text = stringResource(R.string.attendance_mark_all_present),
                    onClick = onMarkAllPresent,
                    leadingIcon = Icons.Outlined.DoneAll,
                )
            }
        }
    }
}
