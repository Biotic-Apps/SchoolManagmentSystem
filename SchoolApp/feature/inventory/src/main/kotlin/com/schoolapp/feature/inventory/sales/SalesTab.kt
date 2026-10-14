package com.schoolapp.feature.inventory.sales

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.lazy.itemsIndexed
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.outlined.Add
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.unit.dp
import com.schoolapp.core.designsystem.component.AppCard
import com.schoolapp.core.designsystem.component.InlineMessage
import com.schoolapp.core.designsystem.component.PrimaryButton
import com.schoolapp.core.designsystem.component.ScreenColumn
import com.schoolapp.core.designsystem.component.SecondaryButton
import com.schoolapp.core.designsystem.component.StatusTone
import com.schoolapp.core.designsystem.theme.AppColors
import com.schoolapp.core.model.inventory.InventoryItem
import com.schoolapp.core.ui.actionErrorMessage
import com.schoolapp.feature.inventory.R
import com.schoolapp.feature.inventory.components.LineEditor
import com.schoolapp.feature.inventory.components.LinePrice
import com.schoolapp.feature.inventory.components.TotalLine
import com.schoolapp.feature.inventory.components.toPickerOptions

/** Sell saleable items to a student; the total is added to the student's fee invoice. */
@Composable
internal fun SalesTab(state: SalesUiState, catalog: List<InventoryItem>, viewModel: SalesViewModel, modifier: Modifier = Modifier) {
    val saleable = catalog.filter { it.saleable }
    val prices = saleable.associate { it.id to it.salePriceMinor }
    val options = saleable.toPickerOptions()
    val total = state.lines.sumOf { line -> (line.quantityValue ?: 0) * (line.itemId?.let { prices[it] } ?: 0L) }
    ScreenColumn(modifier.fillMaxSize(), contentPadding = PaddingValues(16.dp), itemSpacing = 12.dp) {
        item(key = "intro") {
            AppCard(verticalSpacing = 4.dp) {
                Text(stringResource(R.string.inv_sell_title), style = MaterialTheme.typography.titleMedium, color = AppColors.TextPrimary)
                Text(stringResource(R.string.inv_sell_note), style = MaterialTheme.typography.bodyMedium, color = AppColors.TextSecondary)
            }
        }
        if (saleable.isEmpty()) item(key = "none") { InlineMessage(stringResource(R.string.inv_no_saleable), StatusTone.Warning) }
        state.error?.let { item(key = "error") { InlineMessage(actionErrorMessage(it), StatusTone.Error) } }
        item(key = "student") { SaleStudentPicker(state, viewModel) }
        itemsIndexed(state.lines, key = { _, line -> "line_${line.key}" }) { index, line ->
            LineEditor(
                index = index,
                line = line,
                options = options,
                price = LinePrice.Fixed(line.itemId?.let { prices[it] }),
                onItem = { viewModel.onItem(line.key, it) },
                onQuantity = { viewModel.onQuantity(line.key, it) },
                onPrice = {},
                onRemove = if (state.lines.size > 1) ({ viewModel.removeLine(line.key) }) else null,
                enabled = !state.isSaving,
            )
        }
        item(key = "footer") {
            Column(verticalArrangement = Arrangement.spacedBy(12.dp)) {
                (state.stockError ?: state.linesError?.let { stringResource(it) })?.let {
                    Text(it, style = MaterialTheme.typography.bodySmall, color = AppColors.Error)
                }
                SecondaryButton(stringResource(R.string.inv_add_line), viewModel::addLine, leadingIcon = Icons.Outlined.Add, enabled = !state.isSaving)
                TotalLine(stringResource(R.string.inv_total_to_invoice), total, emphasis = true)
                PrimaryButton(
                    text = stringResource(R.string.inv_record_sale),
                    onClick = viewModel::submit,
                    loading = state.isSaving,
                    enabled = saleable.isNotEmpty(),
                    modifier = Modifier.fillMaxWidth(),
                )
            }
        }
    }
}
