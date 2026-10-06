package com.schoolapp.feature.dashboard.components

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.unit.dp
import com.schoolapp.core.designsystem.component.AppCard
import com.schoolapp.core.designsystem.component.PersonAvatar
import com.schoolapp.core.designsystem.component.StatusChip
import com.schoolapp.core.designsystem.theme.AppColors
import com.schoolapp.core.model.ChildSummary
import com.schoolapp.core.model.attendance.AttendanceStatus
import com.schoolapp.feature.dashboard.R
import com.schoolapp.feature.dashboard.parent.attendanceChip

/** Active child with today's attendance; [showAttendance] false while the day is still loading. */
@Composable
internal fun ChildHeaderCard(
    child: ChildSummary,
    attendance: AttendanceStatus?,
    showAttendance: Boolean,
    modifier: Modifier = Modifier,
) {
    AppCard(modifier.fillMaxWidth()) {
        Row(horizontalArrangement = Arrangement.spacedBy(12.dp), verticalAlignment = Alignment.CenterVertically) {
            PersonAvatar(name = child.fullName, photoUrl = child.photoUrl, size = 48.dp)
            Column(Modifier.weight(1f), verticalArrangement = Arrangement.spacedBy(4.dp)) {
                Text(child.fullName, style = MaterialTheme.typography.titleMedium, color = AppColors.TextPrimary)
                listOfNotNull(child.className, child.sectionName).joinToString(" - ").takeIf { it.isNotBlank() }?.let {
                    Text(it, style = MaterialTheme.typography.bodyMedium, color = AppColors.TextSecondary)
                }
            }
        }
        if (showAttendance) {
            val chip = attendanceChip(attendance)
            Row(
                modifier = Modifier.fillMaxWidth().padding(top = 12.dp),
                horizontalArrangement = Arrangement.spacedBy(8.dp),
                verticalAlignment = Alignment.CenterVertically,
            ) {
                Text(
                    stringResource(R.string.dashboard_attendance_today),
                    style = MaterialTheme.typography.bodyMedium,
                    color = AppColors.TextSecondary,
                )
                StatusChip(stringResource(chip.labelRes), chip.tone)
            }
        }
    }
}

