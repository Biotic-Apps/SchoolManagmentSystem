package com.schoolapp.feature.attendance.staffmark.components

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.width
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.outlined.EditNote
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
import com.schoolapp.core.designsystem.theme.AppColors
import com.schoolapp.core.model.attendance.AttendanceStatus
import com.schoolapp.core.ui.formatTime
import com.schoolapp.feature.attendance.R
import com.schoolapp.feature.attendance.register.components.StatusSegment
import com.schoolapp.feature.attendance.staffmark.StaffRowUi

/** One staff member: P / A / L / Lv / ½ picker, plus check times and remark behind the edit button. */
@Composable
internal fun StaffMarkRow(
    row: StaffRowUi,
    enabled: Boolean,
    onSelect: (AttendanceStatus) -> Unit,
    onEditDetails: () -> Unit,
    modifier: Modifier = Modifier,
) {
    AppCard(modifier = modifier, contentPadding = 12.dp) {
        Column(verticalArrangement = Arrangement.spacedBy(8.dp)) {
            Row(verticalAlignment = Alignment.CenterVertically) {
                PersonAvatar(row.name, row.photoUrl)
                Spacer(Modifier.width(12.dp))
                Column(Modifier.weight(1f), verticalArrangement = Arrangement.spacedBy(2.dp)) {
                    Text(row.name, style = MaterialTheme.typography.bodyLarge, color = AppColors.TextPrimary)
                    row.designation?.let {
                        Text(it, style = MaterialTheme.typography.bodySmall, color = AppColors.TextSecondary)
                    }
                    detailsLine(row)?.let {
                        Text(it, style = MaterialTheme.typography.bodySmall, color = AppColors.TextSecondary)
                    }
                }
                IconButton(onClick = onEditDetails, enabled = enabled) {
                    Icon(
                        Icons.Outlined.EditNote,
                        contentDescription = stringResource(R.string.attendance_staff_details_for, row.name),
                        tint = if (enabled) AppColors.Primary else AppColors.TextSecondary,
                    )
                }
            }
            StatusSegment(row.status, row.name, onSelect = { if (enabled) onSelect(it) })
        }
    }
}

/** "Check in 7:50 AM · Check out 2:00 PM · remark", or null when there is nothing to show. */
@Composable
private fun detailsLine(row: StaffRowUi): String? {
    val parts = buildList {
        formatTime(row.checkIn)?.let { add(stringResource(R.string.attendance_check_in, it)) }
        formatTime(row.checkOut)?.let { add(stringResource(R.string.attendance_check_out, it)) }
        row.remark?.trim()?.takeIf { it.isNotEmpty() }?.let(::add)
    }
    return parts.takeIf { it.isNotEmpty() }?.joinToString(" · ")
}
