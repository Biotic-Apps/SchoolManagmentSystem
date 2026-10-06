package com.schoolapp.feature.attendance.components

import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.width
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.outlined.EventNote
import androidx.compose.material3.Icon
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.res.pluralStringResource
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.unit.dp
import com.schoolapp.core.designsystem.component.AppCard
import com.schoolapp.core.designsystem.component.StatusChip
import com.schoolapp.core.designsystem.component.StatusTone
import com.schoolapp.core.designsystem.theme.AppColors
import com.schoolapp.feature.attendance.R

/** Card that opens the leave review screen; [pendingCount] adds a "N pending" chip when known. */
@Composable
internal fun LeaveReviewEntry(onClick: () -> Unit, modifier: Modifier = Modifier, pendingCount: Int? = null) {
    AppCard(modifier = modifier, onClick = onClick, contentPadding = 12.dp) {
        Row(verticalAlignment = Alignment.CenterVertically) {
            Icon(Icons.AutoMirrored.Outlined.EventNote, contentDescription = null, tint = AppColors.Primary)
            Spacer(Modifier.width(12.dp))
            Column(Modifier.weight(1f)) {
                Text(stringResource(R.string.attendance_leave_requests), style = MaterialTheme.typography.titleSmall, color = AppColors.TextPrimary)
                Text(
                    stringResource(R.string.attendance_leave_requests_supporting),
                    style = MaterialTheme.typography.bodySmall,
                    color = AppColors.TextSecondary,
                )
            }
            if (pendingCount != null && pendingCount > 0) {
                Spacer(Modifier.width(8.dp))
                StatusChip(pluralStringResource(R.plurals.attendance_pending_count, pendingCount, pendingCount), StatusTone.Warning)
            }
        }
    }
}
