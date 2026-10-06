package com.schoolapp.feature.exams.results.components

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.width
import androidx.compose.material3.LinearProgressIndicator
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.semantics.contentDescription
import androidx.compose.ui.semantics.semantics
import androidx.compose.ui.unit.dp
import com.schoolapp.core.designsystem.component.AppCard
import com.schoolapp.core.designsystem.component.TabularNumbers
import com.schoolapp.core.designsystem.theme.AppColors
import com.schoolapp.core.model.exams.TrendPoint
import com.schoolapp.feature.exams.R
import com.schoolapp.feature.exams.components.formatMarks

/** Overall percentage per exam, oldest to newest, as labelled bars. */
@Composable
internal fun TrendCard(trend: List<TrendPoint>, modifier: Modifier = Modifier) {
    AppCard(modifier) {
        Column(verticalArrangement = Arrangement.spacedBy(12.dp)) {
            Text(stringResource(R.string.exams_trend_title), style = MaterialTheme.typography.titleMedium, color = AppColors.TextPrimary)
            Text(stringResource(R.string.exams_trend_hint), style = MaterialTheme.typography.bodySmall, color = AppColors.TextSecondary)
            trend.forEach { point -> TrendRow(point) }
        }
    }
}

@Composable
private fun TrendRow(point: TrendPoint) {
    val percent = stringResource(R.string.exams_percent_value, formatMarks(point.percent))
    Column(
        Modifier.semantics(mergeDescendants = true) { contentDescription = "${point.examName}: $percent" },
        verticalArrangement = Arrangement.spacedBy(6.dp),
    ) {
        Row(verticalAlignment = Alignment.CenterVertically) {
            Text(point.examName, style = MaterialTheme.typography.bodyMedium, color = AppColors.TextPrimary, modifier = Modifier.weight(1f))
            Spacer(Modifier.width(8.dp))
            Text(
                percent,
                style = MaterialTheme.typography.labelLarge.copy(fontFeatureSettings = TabularNumbers),
                color = AppColors.Primary,
            )
        }
        LinearProgressIndicator(
            progress = { (point.percent / 100.0).toFloat().coerceIn(0f, 1f) },
            modifier = Modifier.fillMaxWidth().height(8.dp).clip(MaterialTheme.shapes.small),
            color = AppColors.Primary,
            trackColor = AppColors.Border,
            drawStopIndicator = {},
        )
    }
}
