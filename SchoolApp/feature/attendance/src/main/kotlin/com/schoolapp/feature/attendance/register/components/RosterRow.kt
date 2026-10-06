package com.schoolapp.feature.attendance.register.components

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.width
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.outlined.MedicalInformation
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
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
import com.schoolapp.core.model.attendance.AttendanceStatus
import com.schoolapp.feature.attendance.R
import com.schoolapp.feature.attendance.components.attendanceStatusLabel
import com.schoolapp.feature.attendance.components.tone
import com.schoolapp.feature.attendance.register.RosterEntryUi

/**
 * One student. When [editable] the whole row cycles the mark and the segmented picker sets it directly;
 * [onClick] alone (read-only) is used for correction requests on a locked register.
 */
@Composable
internal fun RosterRow(
    entry: RosterEntryUi,
    editable: Boolean,
    onClick: (() -> Unit)?,
    onSelect: (AttendanceStatus) -> Unit,
    onAlertClick: () -> Unit,
    modifier: Modifier = Modifier,
) {
    AppCard(modifier = modifier, onClick = onClick, contentPadding = 12.dp) {
        Column(verticalArrangement = Arrangement.spacedBy(8.dp)) {
            Row(verticalAlignment = Alignment.CenterVertically) {
                PersonAvatar(entry.name, entry.photoUrl)
                Spacer(Modifier.width(12.dp))
                Column(Modifier.weight(1f), verticalArrangement = Arrangement.spacedBy(2.dp)) {
                    val title = entry.rollNo?.let { stringResource(R.string.attendance_roll_name, it, entry.name) } ?: entry.name
                    Text(title, style = MaterialTheme.typography.bodyLarge, color = AppColors.TextPrimary)
                    if (entry.onLeave) {
                        Text(stringResource(R.string.attendance_on_approved_leave), style = MaterialTheme.typography.bodySmall, color = AppColors.Info)
                    }
                    entry.remark?.takeIf { it.isNotBlank() }?.let {
                        Text(it, style = MaterialTheme.typography.bodySmall, color = AppColors.TextSecondary)
                    }
                    if (entry.differs) {
                        Text(
                            stringResource(R.string.attendance_your_mark, attendanceStatusLabel(entry.myStatus)),
                            style = MaterialTheme.typography.bodySmall,
                            color = AppColors.Warning,
                        )
                    }
                }
                if (entry.alert != null) {
                    IconButton(onClick = onAlertClick) {
                        Icon(
                            Icons.Outlined.MedicalInformation,
                            contentDescription = stringResource(R.string.attendance_health_alert_for, entry.name),
                            tint = AppColors.Error,
                        )
                    }
                }
                if (!editable) {
                    Spacer(Modifier.width(4.dp))
                    StatusChip(attendanceStatusLabel(entry.status), entry.status.tone())
                }
            }
            if (editable) StatusSegment(entry.status, entry.name, onSelect)
        }
    }
}
