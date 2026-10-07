package com.schoolapp.core.designsystem.component

import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.Icon
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.alpha
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp

/** Keeps the label measured while loading so the button does not change width. */
@Composable
internal fun ButtonContent(
    text: String,
    loading: Boolean,
    indicatorColor: Color,
    leadingIcon: ImageVector? = null,
) {
    Box(contentAlignment = Alignment.Center) {
        Row(
            modifier = Modifier.alpha(if (loading) 0f else 1f),
            verticalAlignment = Alignment.CenterVertically,
        ) {
            if (leadingIcon != null) {
                Icon(leadingIcon, contentDescription = null, modifier = Modifier.size(18.dp))
                Spacer(Modifier.width(8.dp))
            }
            Text(text, style = MaterialTheme.typography.labelLarge.copy(fontWeight = FontWeight.SemiBold))
        }
        if (loading) {
            CircularProgressIndicator(
                modifier = Modifier.size(20.dp),
                color = indicatorColor,
                strokeWidth = 2.dp,
            )
        }
    }
}
