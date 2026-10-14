package com.schoolapp.feature.inventory.components

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.outlined.DeleteOutline
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.unit.dp
import com.schoolapp.core.designsystem.component.AppCard
import com.schoolapp.core.designsystem.component.CreatablePickerField
import com.schoolapp.core.designsystem.component.MoneyField
import com.schoolapp.core.designsystem.component.PickerOption
import com.schoolapp.core.designsystem.theme.AppColors
import com.schoolapp.feature.inventory.R

/** How a [LineEditor] treats the price: typed per line, or fixed (catalogue sale price, read-only). */
sealed interface LinePrice {
    data class Typed(val label: Int) : LinePrice
    data class Fixed(val unitMinor: Long?) : LinePrice
}

/**
 * Card for one line: item picker (or fixed [itemName]), quantity, price and line total, plus a remove
 * button when [onRemove] is set.
 */
@Composable
internal fun LineEditor(
    index: Int,
    line: LineDraft,
    options: List<PickerOption>,
    price: LinePrice,
    onItem: (String?) -> Unit,
    onQuantity: (String) -> Unit,
    onPrice: (String) -> Unit,
    onRemove: (() -> Unit)?,
    modifier: Modifier = Modifier,
    itemName: String? = null,
    enabled: Boolean = true,
) {
    AppCard(modifier, verticalSpacing = 8.dp) {
        Row(Modifier.fillMaxWidth(), verticalAlignment = Alignment.CenterVertically) {
            Text(
                itemName ?: stringResource(R.string.inv_line_number, index + 1),
                style = MaterialTheme.typography.titleSmall,
                color = AppColors.TextPrimary,
                modifier = Modifier.weight(1f),
            )
            if (onRemove != null) {
                IconButton(onClick = onRemove, enabled = enabled) {
                    Icon(Icons.Outlined.DeleteOutline, contentDescription = stringResource(R.string.inv_remove_line), tint = AppColors.Error)
                }
            }
        }
        if (itemName == null) {
            CreatablePickerField(
                label = stringResource(R.string.inv_item),
                options = options,
                selectedId = line.itemId,
                onSelect = onItem,
                enabled = enabled,
                errorText = line.itemError?.let { stringResource(it) },
            )
        }
        Row(horizontalArrangement = Arrangement.spacedBy(12.dp)) {
            QuantityField(
                value = line.quantity,
                onValueChange = onQuantity,
                label = stringResource(R.string.inv_quantity),
                errorText = line.quantityError?.let { stringResource(it) },
                enabled = enabled,
                modifier = Modifier.weight(1f),
            )
            if (price is LinePrice.Typed) {
                MoneyField(
                    value = line.price,
                    onValueChange = onPrice,
                    label = stringResource(price.label),
                    errorText = line.priceError?.let { stringResource(it) },
                    enabled = enabled,
                    modifier = Modifier.weight(1f),
                )
            }
        }
        if (price is LinePrice.Fixed) {
            price.unitMinor?.let { TotalLine(stringResource(R.string.inv_price), it) }
            TotalLine(stringResource(R.string.inv_line_total), (line.quantityValue ?: 0) * (price.unitMinor ?: 0L))
        } else {
            TotalLine(stringResource(R.string.inv_line_total), line.totalMinor)
        }
    }
}
