package com.schoolapp.feature.fees.components

import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import com.schoolapp.core.designsystem.component.AppCard
import com.schoolapp.core.designsystem.component.MoneyText
import com.schoolapp.core.designsystem.theme.AppColors

/** Label over a large amount; used for finance overview tiles. */
@Composable
internal fun MoneyTile(
    label: String,
    amountMinor: Long,
    currency: String,
    modifier: Modifier = Modifier,
    color: Color = AppColors.TextPrimary,
) {
    AppCard(modifier = modifier, contentPadding = 12.dp) {
        Text(label, style = MaterialTheme.typography.bodySmall, color = AppColors.TextSecondary)
        MoneyText(
            amountMinor = amountMinor,
            currency = currency,
            modifier = Modifier.fillMaxWidth(),
            style = MaterialTheme.typography.titleMedium,
            fontWeight = FontWeight.SemiBold,
            color = color,
            textAlign = TextAlign.Start,
        )
    }
}
