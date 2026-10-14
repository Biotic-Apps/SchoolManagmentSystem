package com.schoolapp.feature.students.detail.attendance

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import com.schoolapp.core.designsystem.component.AppCard
import com.schoolapp.core.designsystem.theme.AppColors
import com.schoolapp.core.model.attendance.AttendanceStatus
import com.schoolapp.core.model.attendance.AttendanceSummary
import com.schoolapp.feature.students.R

/** Attendance % for the month and the count of each mark; unmarked days never count as absent. */
@Composable
internal fun AttendanceSummaryCard(summary: AttendanceSummary, modifier: Modifier = Modifier) {
    AppCard(modifier.fillMaxWidth(), verticalSpacing = 12.dp) {
        Row(verticalAlignment = Alignment.CenterVertically) {
            Text(
                stringResource(R.string.sd_att_percent_label),
                style = MaterialTheme.typography.bodyMedium,
                color = AppColors.TextSecondary,
                modifier = Modifier.weight(1f),
            )
            Text(stringResource(R.string.sd_att_percent, summary.percent), style = MaterialTheme.typography.titleLarge, color = AppColors.Primary)
        }
        val counts = listOf(
            AttendanceStatus.PRESENT to summary.present,
            AttendanceStatus.ABSENT to summary.absent,
            AttendanceStatus.LATE to summary.late,
            AttendanceStatus.LEAVE to summary.leave,
            AttendanceStatus.HALF_DAY to summary.halfDay,
            null to summary.unmarked,
        )
        counts.chunked(COLUMNS).forEach { row ->
            Row(Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                row.forEach { (status, count) -> CountCell(status, count, Modifier.weight(1f)) }
            }
        }
    }
}

@Composable
private fun CountCell(status: AttendanceStatus?, count: Int, modifier: Modifier) {
    Column(modifier, horizontalAlignment = Alignment.CenterHorizontally) {
        Text(count.toString(), style = MaterialTheme.typography.titleMedium, color = status.markColors().content, textAlign = TextAlign.Center)
        Text(attendanceLabel(status), style = MaterialTheme.typography.labelSmall, color = AppColors.TextSecondary, textAlign = TextAlign.Center)
    }
}

private const val COLUMNS = 3
