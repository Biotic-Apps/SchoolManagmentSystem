package com.schoolapp.feature.attendance.mark.components

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
import androidx.compose.ui.res.pluralStringResource
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.unit.dp
import com.schoolapp.core.designsystem.component.AppCard
import com.schoolapp.core.designsystem.component.StatusChip
import com.schoolapp.core.designsystem.component.StatusTone
import com.schoolapp.core.designsystem.theme.AppColors
import com.schoolapp.feature.attendance.R
import com.schoolapp.feature.attendance.components.registerStatusLabel
import com.schoolapp.feature.attendance.components.tone
import com.schoolapp.feature.attendance.mark.SectionRegisterRow

@Composable
internal fun SectionRegisterCard(row: SectionRegisterRow, onClick: () -> Unit, modifier: Modifier = Modifier) {
    AppCard(modifier = modifier, onClick = onClick, contentPadding = 12.dp) {
        Row(verticalAlignment = Alignment.CenterVertically) {
            Column(Modifier.weight(1f), verticalArrangement = Arrangement.spacedBy(2.dp)) {
                Text(row.title, style = MaterialTheme.typography.titleSmall, color = AppColors.TextPrimary)
                Text(
                    pluralStringResource(R.plurals.attendance_students, row.studentCount, row.studentCount),
                    style = MaterialTheme.typography.bodySmall,
                    color = AppColors.TextSecondary,
                )
                if (row.hasUnsent) {
                    Text(stringResource(R.string.attendance_unsent_on_phone), style = MaterialTheme.typography.bodySmall, color = AppColors.Info)
                }
            }
            Spacer(Modifier.width(8.dp))
            val status = row.status
            if (status == null) {
                StatusChip(stringResource(R.string.attendance_checking), StatusTone.Neutral)
            } else {
                StatusChip(registerStatusLabel(status), status.tone())
            }
        }
    }
}
