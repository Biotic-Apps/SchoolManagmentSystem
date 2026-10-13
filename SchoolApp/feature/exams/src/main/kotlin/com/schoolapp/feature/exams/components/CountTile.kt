package com.schoolapp.feature.exams.components

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.fillMaxHeight
import androidx.compose.foundation.layout.padding
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.unit.dp
import com.schoolapp.core.designsystem.component.StatusTone
import com.schoolapp.core.designsystem.component.TabularNumbers
import com.schoolapp.core.designsystem.theme.AppColors

/** A count with its label on a tinted tile; the label wraps instead of truncating. */
@Composable
internal fun CountTile(label: String, count: Int, tone: StatusTone, modifier: Modifier = Modifier) {
    val (container, content) = tone.tileColors()
    Column(
        modifier.fillMaxHeight().background(container, MaterialTheme.shapes.small).padding(horizontal = 10.dp, vertical = 8.dp),
        verticalArrangement = Arrangement.spacedBy(2.dp),
    ) {
        Text(count.toString(), style = MaterialTheme.typography.titleLarge.copy(fontFeatureSettings = TabularNumbers), color = content)
        Text(label, style = MaterialTheme.typography.bodySmall, color = AppColors.TextPrimary)
    }
}

private fun StatusTone.tileColors(): Pair<Color, Color> = when (this) {
    StatusTone.Success -> AppColors.SuccessContainer to AppColors.Success
    StatusTone.Warning -> AppColors.WarningContainer to AppColors.Warning
    StatusTone.Error -> AppColors.ErrorContainer to AppColors.Error
    StatusTone.Info -> AppColors.InfoContainer to AppColors.Info
    StatusTone.Neutral -> AppColors.Background to AppColors.TextSecondary
}
