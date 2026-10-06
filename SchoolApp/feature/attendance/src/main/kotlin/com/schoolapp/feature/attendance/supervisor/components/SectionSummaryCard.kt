package com.schoolapp.feature.attendance.supervisor.components

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.width
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.unit.dp
import com.schoolapp.core.designsystem.component.AppCard
import com.schoolapp.core.designsystem.component.StatusChip
import com.schoolapp.core.designsystem.component.StatusTone
import com.schoolapp.core.designsystem.theme.AppColors
import com.schoolapp.core.model.attendance.RegisterStatus
import com.schoolapp.feature.attendance.R
import com.schoolapp.feature.attendance.components.registerStatusLabel
import com.schoolapp.feature.attendance.components.tone
import com.schoolapp.feature.attendance.supervisor.SectionSummaryRow

@Composable
internal fun SectionSummaryCard(row: SectionSummaryRow, onClick: () -> Unit, modifier: Modifier = Modifier) {
    AppCard(modifier = modifier, onClick = onClick, contentPadding = 12.dp) {
        Row(verticalAlignment = Alignment.CenterVertically) {
            Column(Modifier.weight(1f), verticalArrangement = Arrangement.spacedBy(2.dp)) {
                Text(row.title, style = MaterialTheme.typography.titleSmall, color = AppColors.TextPrimary)
                val counts = if (row.total > 0) {
                    stringResource(R.string.attendance_section_counts, row.present, row.absent, row.late, row.leave, row.total)
                } else {
                    stringResource(R.string.attendance_section_no_marks)
                }
                Text(counts, style = MaterialTheme.typography.bodySmall, color = AppColors.TextSecondary)
            }
            Spacer(Modifier.width(8.dp))
            val tone = if (row.notSubmitted && row.status == RegisterStatus.UNMARKED) StatusTone.Warning else row.status.tone()
            StatusChip(registerStatusLabel(row.status), tone)
        }
    }
}
