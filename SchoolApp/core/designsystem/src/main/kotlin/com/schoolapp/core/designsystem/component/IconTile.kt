package com.schoolapp.core.designsystem.component

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.size
import androidx.compose.material3.Icon
import androidx.compose.material3.MaterialTheme
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.unit.Dp
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.ui.unit.dp

/** Tone-tinted square holding a 20dp icon; the leading mark of stat tiles and feature rows. */
@Composable
fun IconTile(icon: ImageVector, tone: StatusTone, modifier: Modifier = Modifier, size: Dp = 40.dp) {
    val colors = if (tone == StatusTone.Neutral) primaryTileColors() else tone.colors()
    Box(
        modifier = modifier.size(size).background(colors.container, RoundedCornerShape(12.dp)),
        contentAlignment = Alignment.Center,
    ) {
        Icon(icon, contentDescription = null, tint = colors.content, modifier = Modifier.size(22.dp))
    }
}
