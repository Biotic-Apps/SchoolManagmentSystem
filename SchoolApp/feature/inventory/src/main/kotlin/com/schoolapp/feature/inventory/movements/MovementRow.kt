package com.schoolapp.feature.inventory.movements

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import com.schoolapp.core.designsystem.component.AppCard
import com.schoolapp.core.designsystem.component.StatusChip
import com.schoolapp.core.designsystem.component.StatusTone
import com.schoolapp.core.designsystem.theme.AppColors
import com.schoolapp.core.model.inventory.StockMovement
import com.schoolapp.core.ui.formatTimestamp
import com.schoolapp.feature.inventory.R
import com.schoolapp.feature.inventory.components.label

/** One movement: item, type, signed quantity, who/why and when (12-hour time). */
@Composable
internal fun MovementRow(movement: StockMovement, modifier: Modifier = Modifier) {
    AppCard(modifier) {
        Row(Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.spacedBy(12.dp), verticalAlignment = Alignment.Top) {
            Column(Modifier.weight(1f), verticalArrangement = Arrangement.spacedBy(4.dp)) {
                Text(movement.item.name.ifBlank { stringResource(R.string.inv_none) }, style = MaterialTheme.typography.titleSmall, color = AppColors.TextPrimary)
                movement.type?.let { StatusChip(stringResource(it.label()), StatusTone.Info) }
                movement.issuedTo?.takeIf { it.isNotBlank() }?.let { Detail(stringResource(R.string.inv_issued_to_line, it)) }
                movement.reason?.takeIf { it.isNotBlank() }?.let { Detail(it) }
                val footer = listOfNotNull(
                    formatTimestamp(movement.createdAt),
                    movement.performedBy?.let { stringResource(R.string.inv_by_line, it) },
                ).joinToString(" · ")
                if (footer.isNotEmpty()) Detail(footer)
            }
            val sign = if (movement.quantity > 0) "+" else ""
            Text(
                "$sign${movement.quantity} ${movement.item.unit}".trim(),
                style = MaterialTheme.typography.titleMedium,
                fontWeight = FontWeight.SemiBold,
                color = if (movement.quantity < 0) AppColors.Error else AppColors.Success,
            )
        }
    }
}

@Composable
private fun Detail(text: String) {
    Text(text, style = MaterialTheme.typography.bodySmall, color = AppColors.TextSecondary)
}
