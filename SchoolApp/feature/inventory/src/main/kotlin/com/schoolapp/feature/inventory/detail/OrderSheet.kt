package com.schoolapp.feature.inventory.detail

import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.res.stringResource
import com.schoolapp.core.designsystem.component.AppBottomSheet
import com.schoolapp.core.designsystem.component.CreatablePickerField
import com.schoolapp.core.designsystem.component.InlineMessage
import com.schoolapp.core.designsystem.component.PickerOption
import com.schoolapp.core.designsystem.component.StatusTone
import com.schoolapp.core.designsystem.theme.AppColors
import com.schoolapp.core.ui.actionErrorMessage
import com.schoolapp.feature.inventory.R
import com.schoolapp.feature.inventory.components.InventoryDateField
import com.schoolapp.feature.inventory.components.LineEditor
import com.schoolapp.feature.inventory.components.LinePrice
import com.schoolapp.feature.inventory.components.SheetSubmitButton
import com.schoolapp.feature.inventory.components.TotalLine

/** [canAddVendor] lets the role add a missing vendor by typing its name. */
@Composable
internal fun OrderSheet(state: OrderFormState, today: String, canAddVendor: Boolean, viewModel: OrderFormViewModel) {
    AppBottomSheet(title = stringResource(R.string.inv_create_order), onDismiss = viewModel::dismiss) {
        Text(stringResource(R.string.inv_order_note), style = MaterialTheme.typography.bodyMedium, color = AppColors.TextSecondary)
        state.error?.let { InlineMessage(actionErrorMessage(it), StatusTone.Error) }
        if (!state.vendorsLoading && state.vendors.isEmpty() && canAddVendor) {
            InlineMessage(stringResource(R.string.inv_no_vendors), StatusTone.Info)
        }
        CreatablePickerField(
            label = stringResource(R.string.inv_vendor),
            options = state.vendors.map { PickerOption(it.id, it.name) },
            selectedId = state.vendorId,
            onSelect = viewModel::onVendor,
            onCreate = if (canAddVendor) viewModel::createVendor else null,
            createLabel = { stringResource(R.string.inv_add_vendor, it) },
            enabled = !state.vendorsLoading && !state.isCreatingVendor && !state.isSaving,
            errorText = stringResource(R.string.inv_err_vendor).takeIf { state.vendorError },
        )
        InventoryDateField(
            date = state.expectedOn,
            label = stringResource(R.string.inv_expected_on),
            onDateSelected = viewModel::onExpectedOn,
            minDate = today,
            enabled = !state.isSaving,
        )
        state.lines.forEachIndexed { index, line ->
            LineEditor(
                index = index,
                line = line,
                options = emptyList(),
                price = LinePrice.Typed(R.string.inv_unit_price),
                onItem = {},
                onQuantity = { viewModel.onQuantity(line.key, it) },
                onPrice = { viewModel.onPrice(line.key, it) },
                onRemove = null,
                itemName = line.itemId?.let { state.names[it] }.orEmpty(),
                enabled = !state.isSaving,
            )
        }
        TotalLine(stringResource(R.string.inv_order_total), state.totalMinor, emphasis = true)
        SheetSubmitButton(stringResource(R.string.inv_create_order), viewModel::submit, state.isSaving)
    }
}
