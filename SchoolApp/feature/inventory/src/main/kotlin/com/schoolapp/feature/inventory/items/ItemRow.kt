package com.schoolapp.feature.inventory.items

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.ExperimentalLayoutApi
import androidx.compose.foundation.layout.FlowRow
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.unit.dp
import com.schoolapp.core.designsystem.component.AppCard
import com.schoolapp.core.designsystem.component.MoneyText
import com.schoolapp.core.designsystem.component.StatusChip
import com.schoolapp.core.designsystem.component.StatusTone
import com.schoolapp.core.designsystem.theme.AppColors
import com.schoolapp.core.model.inventory.InventoryItem
import com.schoolapp.feature.inventory.R
import com.schoolapp.feature.inventory.components.label

/** Catalogue item: name, SKU · category · unit, reorder level, branch stock, Asset/Saleable flags and price. */
@OptIn(ExperimentalLayoutApi::class)
@Composable
internal fun ItemRow(item: InventoryItem, modifier: Modifier = Modifier) {
    AppCard(modifier, verticalSpacing = 6.dp) {
        Row(Modifier.fillMaxWidth(), verticalAlignment = Alignment.Top, horizontalArrangement = Arrangement.spacedBy(12.dp)) {
            Column(Modifier.weight(1f), verticalArrangement = Arrangement.spacedBy(2.dp)) {
                Text(item.name, style = MaterialTheme.typography.titleSmall, color = AppColors.TextPrimary)
                val category = item.category?.let { stringResource(it.label()) }
                Text(
                    listOfNotNull(item.sku, category, item.unit.takeIf { it.isNotBlank() }).joinToString(" · "),
                    style = MaterialTheme.typography.bodySmall,
                    color = AppColors.TextSecondary,
                )
            }
            if (item.saleable && item.salePriceMinor != null) {
                MoneyText(item.salePriceMinor ?: 0L, style = MaterialTheme.typography.titleSmall)
            }
        }
        FlowRow(horizontalArrangement = Arrangement.spacedBy(8.dp), verticalArrangement = Arrangement.spacedBy(6.dp)) {
            item.stock?.let {
                StatusChip(stringResource(R.string.inv_stock_here, it, item.unit).trim(), if (item.lowStock == true) StatusTone.Warning else StatusTone.Neutral)
            }
            if (item.lowStock == true) StatusChip(stringResource(R.string.inv_low_stock), StatusTone.Warning)
            StatusChip(stringResource(R.string.inv_reorder_at, item.reorderLevel), StatusTone.Neutral)
            if (item.isAsset) StatusChip(stringResource(R.string.inv_flag_asset), StatusTone.Success)
            if (item.saleable) StatusChip(stringResource(R.string.inv_flag_saleable), StatusTone.Info)
        }
    }
}
