package com.schoolapp.feature.attendance.components

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.IntrinsicSize
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxHeight
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.Immutable
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.semantics.clearAndSetSemantics
import androidx.compose.ui.semantics.contentDescription
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import com.schoolapp.core.designsystem.component.AppCard
import com.schoolapp.core.designsystem.component.IconTile
import com.schoolapp.core.designsystem.component.StatusTone
import com.schoolapp.core.designsystem.theme.AppColors

@Immutable
internal data class LeaveStat(val label: String, val value: Int, val icon: ImageVector, val tone: StatusTone)

/** One row of equal-height summary tiles (all tiles take the tallest tile's height). */
@Composable
internal fun LeaveStatTiles(stats: List<LeaveStat>, modifier: Modifier = Modifier) {
    Row(modifier.fillMaxWidth().height(IntrinsicSize.Min), horizontalArrangement = Arrangement.spacedBy(12.dp)) {
        stats.forEach { stat -> LeaveStatTile(stat, Modifier.weight(1f).fillMaxHeight()) }
    }
}

@Composable
private fun LeaveStatTile(stat: LeaveStat, modifier: Modifier) {
    AppCard(
        modifier = modifier.clearAndSetSemantics { contentDescription = "${stat.value} ${stat.label}" },
        contentPadding = 12.dp,
        verticalSpacing = 6.dp,
        animateSize = false,
    ) {
        IconTile(stat.icon, stat.tone, size = 36.dp)
        Text(stat.value.toString(), style = MaterialTheme.typography.headlineSmall, color = AppColors.TextPrimary)
        Text(
            stat.label,
            style = MaterialTheme.typography.bodySmall,
            color = AppColors.TextSecondary,
            maxLines = 2,
            overflow = TextOverflow.Ellipsis,
        )
    }
}
