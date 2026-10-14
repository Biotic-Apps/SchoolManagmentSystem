package com.schoolapp.feature.inventory.stock

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.outlined.WarningAmber
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import com.schoolapp.core.designsystem.component.AppCard
import com.schoolapp.core.designsystem.component.StatusChip
import com.schoolapp.core.designsystem.component.StatusTone
import com.schoolapp.core.designsystem.theme.AppColors
import com.schoolapp.core.model.inventory.StockLine
import com.schoolapp.feature.inventory.R
import com.schoolapp.feature.inventory.components.label

/** One item's stock: name, SKU and category, quantity with unit, reorder level and a low-stock flag. */
@Composable
internal fun StockRow(line: StockLine, modifier: Modifier = Modifier) {
    AppCard(modifier, tone = if (line.low) StatusTone.Warning else null) {
        Row(Modifier.fillMaxWidth(), verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(12.dp)) {
            Column(Modifier.weight(1f), verticalArrangement = Arrangement.spacedBy(2.dp)) {
                Text(
                    line.item.name.ifBlank { stringResource(R.string.inv_none) },
                    style = MaterialTheme.typography.titleSmall,
                    color = AppColors.TextPrimary,
                    maxLines = 2,
                    overflow = TextOverflow.Ellipsis,
                )
                val category = line.item.category?.let { stringResource(it.label()) }
                Text(
                    listOfNotNull(line.item.sku.takeIf { it.isNotBlank() }, category).joinToString(" · "),
                    style = MaterialTheme.typography.bodySmall,
                    color = AppColors.TextSecondary,
                )
                line.reorderLevel?.let {
                    Text(stringResource(R.string.inv_reorder_at, it), style = MaterialTheme.typography.bodySmall, color = AppColors.TextSecondary)
                }
            }
            Column(horizontalAlignment = Alignment.End, verticalArrangement = Arrangement.spacedBy(6.dp)) {
                Text(
                    stringResource(R.string.inv_qty_unit, line.quantity, line.item.unit).trim(),
                    style = MaterialTheme.typography.titleMedium,
                    fontWeight = FontWeight.SemiBold,
                    color = AppColors.TextPrimary,
                )
                if (line.low) StatusChip(stringResource(R.string.inv_low_stock), StatusTone.Warning, icon = Icons.Outlined.WarningAmber)
            }
        }
    }
}
