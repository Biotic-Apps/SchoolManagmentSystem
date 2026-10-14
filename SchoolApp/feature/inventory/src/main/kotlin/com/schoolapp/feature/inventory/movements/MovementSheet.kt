package com.schoolapp.feature.inventory.movements

import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.res.stringResource
import com.schoolapp.core.designsystem.component.AppBottomSheet
import com.schoolapp.core.designsystem.component.AppTextArea
import com.schoolapp.core.designsystem.component.AppTextField
import com.schoolapp.core.designsystem.component.CreatablePickerField
import com.schoolapp.core.designsystem.component.FieldKind
import com.schoolapp.core.designsystem.component.InlineMessage
import com.schoolapp.core.designsystem.component.PickerOption
import com.schoolapp.core.designsystem.component.SegmentedChoice
import com.schoolapp.core.designsystem.component.StatusTone
import com.schoolapp.core.designsystem.theme.AppColors
import com.schoolapp.core.model.inventory.InventoryItem
import com.schoolapp.core.model.inventory.MovementType
import com.schoolapp.core.model.organisation.BranchOption
import com.schoolapp.core.ui.actionErrorMessage
import com.schoolapp.feature.inventory.R
import com.schoolapp.feature.inventory.components.QuantityField
import com.schoolapp.feature.inventory.components.SheetSubmitButton
import com.schoolapp.feature.inventory.components.label
import com.schoolapp.feature.inventory.components.toPickerOptions

@Composable
internal fun MovementSheet(
    state: MovementFormState,
    items: List<InventoryItem>,
    otherBranches: List<BranchOption>,
    viewModel: MovementFormViewModel,
) {
    AppBottomSheet(title = stringResource(R.string.inv_movement_title), onDismiss = viewModel::dismiss) {
        Text(stringResource(R.string.inv_movement_note), style = MaterialTheme.typography.bodyMedium, color = AppColors.TextSecondary)
        state.error?.let { InlineMessage(actionErrorMessage(it), StatusTone.Error) }
        CreatablePickerField(
            label = stringResource(R.string.inv_item),
            options = items.toPickerOptions(),
            selectedId = state.itemId,
            onSelect = viewModel::onItem,
            errorText = state.errors[MovementField.ITEM]?.let { stringResource(it) },
        )
        val types = MovementType.entries.map { PickerOption(it.name, stringResource(it.label())) }
        CreatablePickerField(
            label = stringResource(R.string.inv_movement_type),
            options = types,
            selectedId = state.type.name,
            onSelect = { id -> MovementType.entries.firstOrNull { it.name == id }?.let(viewModel::onType) },
        )
        if (state.type == MovementType.ADJUST) {
            SegmentedChoice(
                labels = listOf(stringResource(R.string.inv_direction_add), stringResource(R.string.inv_direction_remove)),
                selectedIndex = if (state.remove) 1 else 0,
                onSelect = { viewModel.onRemove(it == 1) },
            )
        }
        val takesOut = state.type == MovementType.ISSUE || state.type == MovementType.TRANSFER_OUT
        val hint = listOfNotNull(
            stringResource(R.string.inv_issue_hint).takeIf { takesOut },
            state.inStockHint?.let { stringResource(R.string.inv_in_stock, it) },
        ).joinToString(" ").ifBlank { null }
        QuantityField(
            value = state.quantity,
            onValueChange = viewModel::onQuantity,
            label = stringResource(R.string.inv_quantity),
            errorText = state.quantityServerError ?: state.errors[MovementField.QUANTITY]?.let { stringResource(it) },
            supportingText = hint,
        )
        if (state.type == MovementType.TRANSFER_OUT) {
            CreatablePickerField(
                label = stringResource(R.string.inv_to_branch),
                options = otherBranches.map { PickerOption(it.id, it.name) },
                selectedId = state.toBranchId,
                onSelect = viewModel::onToBranch,
                enabled = otherBranches.isNotEmpty(),
                fallbackValue = stringResource(R.string.inv_no_other_branch).takeIf { otherBranches.isEmpty() },
                errorText = state.errors[MovementField.TO_BRANCH]?.let { stringResource(it) },
            )
        }
        if (state.type == MovementType.ISSUE) {
            AppTextField(
                value = state.issuedTo,
                onValueChange = viewModel::onIssuedTo,
                label = stringResource(R.string.inv_issued_to),
                placeholder = stringResource(R.string.inv_issued_to_hint),
                kind = FieldKind.Name,
            )
        }
        AppTextArea(
            value = state.reason,
            onValueChange = viewModel::onReason,
            label = stringResource(R.string.inv_reason),
            minLines = 2,
            errorText = state.errors[MovementField.REASON]?.let { stringResource(it) },
        )
        SheetSubmitButton(stringResource(R.string.inv_record_movement), viewModel::submit, state.isSaving)
    }
}
