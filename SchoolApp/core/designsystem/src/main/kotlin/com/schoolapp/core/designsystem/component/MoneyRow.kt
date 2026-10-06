package com.schoolapp.core.designsystem.component

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.tooling.preview.Preview
import androidx.compose.ui.unit.dp
import com.schoolapp.core.designsystem.money.MoneyFormat
import com.schoolapp.core.designsystem.theme.AppColors

/** Label on the left (wraps), amount on the right (never cut); used for invoice lines, totals and payslips. */
@Composable
fun MoneyRow(
    label: String,
    amountMinor: Long,
    modifier: Modifier = Modifier,
    currency: String = MoneyFormat.DEFAULT_CURRENCY,
    supporting: String? = null,
    emphasized: Boolean = false,
    amountColor: Color = AppColors.TextPrimary,
) {
    Row(
        modifier = modifier.fillMaxWidth().padding(vertical = 6.dp),
        horizontalArrangement = Arrangement.spacedBy(16.dp),
        verticalAlignment = Alignment.Top,
    ) {
        Column(Modifier.weight(1f)) {
            Text(
                text = label,
                style = if (emphasized) MaterialTheme.typography.titleMedium else MaterialTheme.typography.bodyMedium,
                color = if (emphasized) AppColors.TextPrimary else AppColors.TextSecondary,
            )
            supporting?.let { Text(it, style = MaterialTheme.typography.bodySmall, color = AppColors.TextSecondary) }
        }
        MoneyText(
            amountMinor = amountMinor,
            currency = currency,
            style = if (emphasized) MaterialTheme.typography.titleMedium else MaterialTheme.typography.bodyMedium,
            fontWeight = if (emphasized) FontWeight.SemiBold else null,
            color = amountColor,
        )
    }
}

@Preview
@Composable
private fun MoneyRowPreview() = PreviewContainer { MoneyRow("Tuition fee", 1_250_000, supporting = "October 2026") }
