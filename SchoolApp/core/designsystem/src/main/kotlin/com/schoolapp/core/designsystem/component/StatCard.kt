package com.schoolapp.core.designsystem.component

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.material3.Icon
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.tooling.preview.Preview
import androidx.compose.ui.unit.dp
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.outlined.FactCheck
import com.schoolapp.core.designsystem.theme.AppColors

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
    AppCard(modifier = modifier, onClick = onClick) {
        Row(verticalAlignment = Alignment.CenterVertically) {
            if (icon != null) {
                val colors = tone.colors()
                Box(
                    modifier = Modifier.size(36.dp).background(colors.container, MaterialTheme.shapes.small),
                    contentAlignment = Alignment.Center,
                ) {
                    Icon(icon, contentDescription = null, tint = colors.content, modifier = Modifier.size(20.dp))
                }
                Spacer(Modifier.width(12.dp))
            }
            Text(label, style = MaterialTheme.typography.bodySmall, color = AppColors.TextSecondary)
        }
        Text(value, style = MaterialTheme.typography.headlineSmall, color = AppColors.TextPrimary)
        if (supporting != null) {
            Text(supporting, style = MaterialTheme.typography.bodySmall, color = AppColors.TextSecondary)
        }
    }
}

@Preview
@Composable
private fun StatCardPreview() = PreviewContainer {
    StatCard(
        label = "Attendance today",
        value = "94%",
        icon = Icons.AutoMirrored.Outlined.FactCheck,
        tone = StatusTone.Success,
        supporting = "412 of 438 present",
    )
}
