package com.schoolapp.feature.inventory.items

import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.res.stringResource
import com.schoolapp.core.designsystem.component.AppBottomSheet
import com.schoolapp.core.designsystem.component.AppTextField
import com.schoolapp.core.designsystem.component.CreatablePickerField
import com.schoolapp.core.designsystem.component.FieldKind
import com.schoolapp.core.designsystem.component.InlineMessage
import com.schoolapp.core.designsystem.component.MoneyField
import com.schoolapp.core.designsystem.component.PickerOption
import com.schoolapp.core.designsystem.component.StatusTone
import com.schoolapp.core.designsystem.component.SwitchRow
import com.schoolapp.core.designsystem.theme.AppColors
import com.schoolapp.core.model.inventory.ItemCategory
import com.schoolapp.core.ui.actionErrorMessage
import com.schoolapp.feature.inventory.R
import com.schoolapp.feature.inventory.components.QuantityField
import com.schoolapp.feature.inventory.components.SheetSubmitButton
import com.schoolapp.feature.inventory.components.label

@Composable
internal fun ItemSheet(state: ItemFormState, viewModel: ItemFormViewModel) {
    fun error(field: ItemField): Int? = state.errors[field]
    AppBottomSheet(title = stringResource(R.string.inv_add_item), onDismiss = viewModel::dismiss) {
        Text(stringResource(R.string.inv_item_note), style = MaterialTheme.typography.bodyMedium, color = AppColors.TextSecondary)
        state.error?.let { InlineMessage(actionErrorMessage(it), StatusTone.Error) }
        AppTextField(
            value = state.sku,
            onValueChange = viewModel::onSku,
            label = stringResource(R.string.inv_sku),
            placeholder = stringResource(R.string.inv_sku_hint),
            kind = FieldKind.Code,
            errorText = error(ItemField.SKU)?.let { stringResource(it) },
        )
        AppTextField(
            value = state.name,
            onValueChange = viewModel::onName,
            label = stringResource(R.string.inv_item_name),
            kind = FieldKind.Title,
            errorText = error(ItemField.NAME)?.let { stringResource(it) },
        )
        CreatablePickerField(
            label = stringResource(R.string.inv_category),
            options = ItemCategory.entries.map { PickerOption(it.name, stringResource(it.label())) },
            selectedId = state.category?.name,
            onSelect = { id -> viewModel.onCategory(ItemCategory.entries.firstOrNull { it.name == id }) },
            errorText = error(ItemField.CATEGORY)?.let { stringResource(it) },
        )
        AppTextField(
            value = state.unit,
            onValueChange = viewModel::onUnit,
            label = stringResource(R.string.inv_unit),
            supportingText = stringResource(R.string.inv_unit_hint),
            errorText = error(ItemField.UNIT)?.let { stringResource(it) },
        )
        QuantityField(
            value = state.reorderLevel,
            onValueChange = viewModel::onReorder,
            label = stringResource(R.string.inv_reorder_level),
            supportingText = stringResource(R.string.inv_reorder_hint),
            errorText = error(ItemField.REORDER)?.let { stringResource(it) },
        )
        SwitchRow(
            title = stringResource(R.string.inv_track_asset),
            checked = state.isAsset,
            onCheckedChange = viewModel::onAsset,
            supporting = stringResource(R.string.inv_track_asset_hint),
        )
        SwitchRow(
            title = stringResource(R.string.inv_saleable),
            checked = state.saleable,
            onCheckedChange = viewModel::onSaleable,
            supporting = stringResource(R.string.inv_saleable_hint),
        )
        if (state.saleable) {
            MoneyField(
                value = state.salePrice,
                onValueChange = viewModel::onPrice,
                label = stringResource(R.string.inv_sale_price),
                errorText = error(ItemField.PRICE)?.let { stringResource(it) },
            )
        }
        SheetSubmitButton(stringResource(R.string.inv_add_item), viewModel::submit, state.isSaving)
    }
}
