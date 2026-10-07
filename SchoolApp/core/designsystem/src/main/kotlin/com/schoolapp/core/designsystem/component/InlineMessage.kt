package com.schoolapp.core.designsystem.component

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.outlined.CheckCircle
import androidx.compose.material.icons.outlined.ErrorOutline
import androidx.compose.material.icons.outlined.Info
import androidx.compose.material.icons.outlined.WarningAmber
import androidx.compose.material3.Icon
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.semantics.LiveRegionMode
import androidx.compose.ui.semantics.liveRegion
import androidx.compose.ui.semantics.semantics
import androidx.compose.ui.tooling.preview.Preview
import androidx.compose.ui.unit.dp
import com.schoolapp.core.designsystem.theme.Borders

/** Tinted inline banner for form-level success/warning/error/info messages. */
@Composable
fun InlineMessage(
    text: String,
    tone: StatusTone,
    modifier: Modifier = Modifier,
) {
    val colors = tone.colors()
    val icon = when (tone) {
        StatusTone.Success -> Icons.Outlined.CheckCircle
        StatusTone.Warning -> Icons.Outlined.WarningAmber
        StatusTone.Error -> Icons.Outlined.ErrorOutline
        StatusTone.Info, StatusTone.Neutral -> Icons.Outlined.Info
    }
    Row(
        modifier = modifier
            .fillMaxWidth()
            .background(colors.container, MaterialTheme.shapes.small)
            .border(Borders.Thin, colors.content.copy(alpha = 0.3f), MaterialTheme.shapes.small)
            .padding(12.dp)
            .semantics { liveRegion = LiveRegionMode.Polite },
        verticalAlignment = Alignment.Top,
    ) {
        Icon(icon, contentDescription = null, tint = colors.content, modifier = Modifier.size(20.dp))
        Spacer(Modifier.width(8.dp))
        Text(text, style = MaterialTheme.typography.bodyMedium, color = colors.content)
    }
}

@Preview
@Composable
private fun InlineMessagePreview() = PreviewContainer {
    InlineMessage(text = "Incorrect email/phone or password.", tone = StatusTone.Error)
}
