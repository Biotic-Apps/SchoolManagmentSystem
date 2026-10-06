package com.schoolapp.feature.health.components

import androidx.compose.foundation.layout.ColumnScope
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.height
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import com.schoolapp.core.designsystem.component.AppCard
import com.schoolapp.core.designsystem.theme.AppColors

/** Titled card for one part of the health card. */
@Composable
internal fun HealthSectionCard(title: String, modifier: Modifier = Modifier, content: @Composable ColumnScope.() -> Unit) {
    AppCard(modifier) {
        Text(title, style = MaterialTheme.typography.titleSmall, fontWeight = FontWeight.SemiBold, color = AppColors.TextSecondary)
        Spacer(Modifier.height(8.dp))
        content()
    }
}

@Composable
internal fun BodyText(text: String, modifier: Modifier = Modifier, color: Color = AppColors.TextPrimary) {
    Text(text, modifier = modifier, style = MaterialTheme.typography.bodyLarge, color = color)
}
