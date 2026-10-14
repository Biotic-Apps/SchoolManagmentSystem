package com.schoolapp.feature.inventory.assets

import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.res.stringResource
import com.schoolapp.core.designsystem.component.AppBottomSheet
import com.schoolapp.core.designsystem.component.AppTextField
import com.schoolapp.core.designsystem.component.CreatablePickerField
import com.schoolapp.core.designsystem.component.FieldKind
import com.schoolapp.core.designsystem.component.InlineMessage
import com.schoolapp.core.designsystem.component.PickerOption
import com.schoolapp.core.designsystem.component.StatusTone
import com.schoolapp.core.designsystem.theme.AppColors
import com.schoolapp.core.model.inventory.AssetCondition
import com.schoolapp.core.model.inventory.InventoryItem
import com.schoolapp.core.ui.actionErrorMessage
import com.schoolapp.feature.inventory.R
import com.schoolapp.feature.inventory.components.SheetSubmitButton
import com.schoolapp.feature.inventory.components.label
import com.schoolapp.feature.inventory.components.toPickerOptions

@Composable
internal fun AssetSheet(state: AssetFormState, catalog: List<InventoryItem>, viewModel: AssetFormViewModel) {
    val editing = state.editing
    val assetItems = catalog.filter { it.isAsset }
    val title = if (editing == null) stringResource(R.string.inv_add_asset) else stringResource(R.string.inv_edit_asset, editing.tag)
    AppBottomSheet(title = title, onDismiss = viewModel::dismiss) {
        if (editing == null) {
            val note = if (assetItems.isEmpty()) R.string.inv_no_asset_items else R.string.inv_asset_note
            Text(stringResource(note), style = MaterialTheme.typography.bodyMedium, color = AppColors.TextSecondary)
        }
        state.error?.let { InlineMessage(actionErrorMessage(it), StatusTone.Error) }
        CreatablePickerField(
            label = stringResource(R.string.inv_item),
            options = assetItems.toPickerOptions(),
            selectedId = state.itemId,
            onSelect = viewModel::onItem,
            enabled = editing == null && assetItems.isNotEmpty(),
            fallbackValue = editing?.item?.name,
            errorText = state.errors[AssetField.ITEM]?.let { stringResource(it) },
        )
        AppTextField(
            value = state.tag,
            onValueChange = viewModel::onTag,
            label = stringResource(R.string.inv_asset_tag),
            placeholder = stringResource(R.string.inv_asset_tag_hint),
            kind = FieldKind.Code,
            enabled = editing == null,
            errorText = state.errors[AssetField.TAG]?.let { stringResource(it) },
        )
        CreatablePickerField(
            label = stringResource(R.string.inv_condition),
            options = AssetCondition.entries.map { PickerOption(it.name, stringResource(it.label())) },
            selectedId = state.condition.name,
            onSelect = { id -> AssetCondition.entries.firstOrNull { it.name == id }?.let(viewModel::onCondition) },
        )
        AppTextField(
            value = state.location,
            onValueChange = viewModel::onLocation,
            label = stringResource(R.string.inv_location),
            placeholder = stringResource(R.string.inv_location_hint),
            kind = FieldKind.Title,
            errorText = state.errors[AssetField.LOCATION]?.let { stringResource(it) },
        )
        AppTextField(
            value = state.assignedTo,
            onValueChange = viewModel::onAssignedTo,
            label = stringResource(R.string.inv_assigned_to),
            placeholder = stringResource(R.string.inv_issued_to_hint),
            kind = FieldKind.Name,
        )
        val submit = if (editing == null) R.string.inv_add_asset else R.string.inv_save_changes
        SheetSubmitButton(stringResource(submit), viewModel::submit, state.isSaving)
    }
}
