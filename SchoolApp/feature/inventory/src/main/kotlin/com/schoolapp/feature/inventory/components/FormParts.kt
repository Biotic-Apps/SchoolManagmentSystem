package com.schoolapp.feature.inventory.components

import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.font.FontWeight
import com.schoolapp.core.designsystem.component.AppTextField
import com.schoolapp.core.designsystem.component.FieldKind
import com.schoolapp.core.designsystem.component.MoneyText
import com.schoolapp.core.designsystem.component.PickerOption
import com.schoolapp.core.designsystem.component.PrimaryButton
import com.schoolapp.core.designsystem.theme.AppColors
import com.schoolapp.core.model.inventory.InventoryItem

/** Whole-number field; anything but digits is dropped while typing. */
@Composable
internal fun QuantityField(
    value: String,
    onValueChange: (String) -> Unit,
    label: String,
    modifier: Modifier = Modifier,
    errorText: String? = null,
    supportingText: String? = null,
    enabled: Boolean = true,
) {
    AppTextField(
        value = value,
        onValueChange = { typed -> onValueChange(typed.filter { it.isDigit() }.take(MAX_DIGITS)) },
        label = label,
        modifier = modifier,
        errorText = errorText,
        supportingText = supportingText,
        enabled = enabled,
        kind = FieldKind.Number,
    )
}

/** "Label ........ Rs 1,200" line used for line and form totals. */
@Composable
internal fun TotalLine(label: String, amountMinor: Long, modifier: Modifier = Modifier, emphasis: Boolean = false) {
    Row(modifier.fillMaxWidth(), verticalAlignment = Alignment.CenterVertically) {
        Text(
            label,
            style = if (emphasis) MaterialTheme.typography.titleSmall else MaterialTheme.typography.bodyMedium,
            color = AppColors.TextSecondary,
            modifier = Modifier.weight(1f),
        )
        MoneyText(
            amountMinor,
            style = if (emphasis) MaterialTheme.typography.titleMedium else MaterialTheme.typography.bodyMedium,
            fontWeight = if (emphasis) FontWeight.SemiBold else null,
        )
    }
}

@Composable
internal fun SheetSubmitButton(text: String, onClick: () -> Unit, loading: Boolean, enabled: Boolean = true) {
    PrimaryButton(text = text, onClick = onClick, loading = loading, enabled = enabled, modifier = Modifier.fillMaxWidth())
}

/** Catalogue items as picker rows: "Name (SKU)" plus unit. */
internal fun List<InventoryItem>.toPickerOptions(): List<PickerOption> = map { item ->
    PickerOption(item.id, if (item.sku.isNotBlank()) "${item.name} (${item.sku})" else item.name, item.unit.takeIf { it.isNotBlank() })
}

/** Parses a quantity typed into a [QuantityField]; null when blank or too large. */
internal fun String.toQuantity(): Int? = trim().toIntOrNull()

private const val MAX_DIGITS = 7
