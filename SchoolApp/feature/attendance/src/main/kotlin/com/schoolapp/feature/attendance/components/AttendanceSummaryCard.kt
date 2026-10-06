package com.schoolapp.feature.attendance.components

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.unit.dp
import com.schoolapp.core.designsystem.component.AppCard
import com.schoolapp.core.designsystem.component.StatusTone
import com.schoolapp.core.designsystem.theme.AppColors
import com.schoolapp.core.model.attendance.AttendanceStatus
import com.schoolapp.core.model.attendance.AttendanceSummary
import com.schoolapp.feature.attendance.R

/** Percentage plus every bucket; unmarked days are listed on their own and never counted as absent. */
@Composable
internal fun AttendanceSummaryCard(title: String, summary: AttendanceSummary, modifier: Modifier = Modifier) {
    AppCard(modifier) {
        Column(verticalArrangement = Arrangement.spacedBy(12.dp)) {
            Text(title, style = MaterialTheme.typography.titleSmall, color = AppColors.TextSecondary)
            Text(
                stringResource(R.string.attendance_percent, summary.percent),
                style = MaterialTheme.typography.headlineMedium,
                color = AppColors.TextPrimary,
            )
            CountsGrid(
                listOf(
                    CountItem(attendanceStatusLabel(AttendanceStatus.PRESENT), summary.present, StatusTone.Success),
                    CountItem(attendanceStatusLabel(AttendanceStatus.ABSENT), summary.absent, StatusTone.Error),
                    CountItem(attendanceStatusLabel(AttendanceStatus.LATE), summary.late, StatusTone.Warning),
                    CountItem(attendanceStatusLabel(AttendanceStatus.LEAVE), summary.leave, StatusTone.Info),
                    CountItem(attendanceStatusLabel(AttendanceStatus.HALF_DAY), summary.halfDay, StatusTone.Info),
                    CountItem(attendanceStatusLabel(null), summary.unmarked, StatusTone.Neutral),
                ),
            )
            Text(
                stringResource(R.string.attendance_unmarked_note),
                style = MaterialTheme.typography.bodySmall,
                color = AppColors.TextSecondary,
            )
        }
    }
}
