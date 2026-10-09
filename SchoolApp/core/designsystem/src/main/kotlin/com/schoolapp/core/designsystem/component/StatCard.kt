package com.schoolapp.core.designsystem.component

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.height
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.outlined.FactCheck
import androidx.compose.material.icons.automirrored.outlined.KeyboardArrowRight
import androidx.compose.material3.Icon
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.tooling.preview.Preview
import androidx.compose.ui.unit.dp
import com.schoolapp.core.designsystem.theme.AppColors

/** KPI tile: tone icon tile, the number (animates when it changes), then its label. Tappable tiles show a chevron. */
@Composable
fun StatCard(
    label: String,
    value: String,
    modifier: Modifier = Modifier,
    icon: ImageVector? = null,
    tone: StatusTone = StatusTone.Neutral,
    supporting: String? = null,
    onClick: (() -> Unit)? = null,
) {
    AppCard(modifier = modifier, onClick = onClick, verticalSpacing = 4.dp) {
        if (icon != null || onClick != null) {
            Row(Modifier.fillMaxWidth(), verticalAlignment = Alignment.CenterVertically) {
                if (icon != null) IconTile(icon, tone)
                Spacer(Modifier.weight(1f))
                if (onClick != null) {
                    Icon(
                        Icons.AutoMirrored.Outlined.KeyboardArrowRight,
                        contentDescription = null,
                        tint = AppColors.TextSecondary,
                        modifier = Modifier.size(20.dp),
                    )
                }
            }
            Spacer(Modifier.height(4.dp))
        }
        AnimatedValueText(value, style = MaterialTheme.typography.headlineSmall, color = AppColors.TextPrimary)
        Text(
            label,
            style = MaterialTheme.typography.bodySmall,
            color = AppColors.TextSecondary,
            maxLines = 2,
            overflow = TextOverflow.Ellipsis,
        )
        if (supporting != null) {
            Text(supporting, style = MaterialTheme.typography.bodySmall, color = AppColors.TextSecondary)
        }
    }
}

@Preview
@Composable
private fun StatCardPreview() = PreviewContainer {
    Row(horizontalArrangement = Arrangement.spacedBy(12.dp)) {
        StatCard(
            label = "Attendance today",
            value = "94%",
            icon = Icons.AutoMirrored.Outlined.FactCheck,
            tone = StatusTone.Success,
            supporting = "412 of 438 present",
            modifier = Modifier.weight(1f),
        )
        StatCard(label = "Leave requests", value = "3", icon = Icons.AutoMirrored.Outlined.FactCheck, tone = StatusTone.Warning, onClick = {}, modifier = Modifier.weight(1f))
    }
}
