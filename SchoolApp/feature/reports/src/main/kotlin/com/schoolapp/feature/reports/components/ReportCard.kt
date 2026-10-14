package com.schoolapp.feature.reports.components

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import com.schoolapp.core.designsystem.component.AppCard
import com.schoolapp.core.designsystem.component.IconTile
import com.schoolapp.core.designsystem.component.StatusTone
import com.schoolapp.core.designsystem.theme.AppColors
import com.schoolapp.core.model.reports.Report

/** One runnable report: icon, title, what it contains and the formats it exports to. */
@Composable
internal fun ReportCard(report: Report, onClick: () -> Unit, modifier: Modifier = Modifier) {
    AppCard(modifier.fillMaxWidth(), onClick = onClick) {
        Row(horizontalArrangement = Arrangement.spacedBy(12.dp), verticalAlignment = Alignment.Top) {
            IconTile(areaIcon(report.area), StatusTone.Info)
            Column(Modifier.weight(1f), verticalArrangement = Arrangement.spacedBy(4.dp)) {
                Text(report.title, style = MaterialTheme.typography.titleSmall, color = AppColors.TextPrimary)
                report.description?.let {
                    Text(it, style = MaterialTheme.typography.bodyMedium, color = AppColors.TextSecondary)
                }
                Text(
                    report.formats.joinToString(" · ") { it.name },
                    style = MaterialTheme.typography.labelMedium,
                    color = AppColors.TextSecondary,
                )
            }
        }
    }
}
