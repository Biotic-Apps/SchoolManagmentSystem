package com.schoolapp.feature.inventory.purchasing

import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.outlined.Add
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.res.stringResource
import com.schoolapp.core.designsystem.component.AppBottomSheet
import com.schoolapp.core.designsystem.component.AppTextArea
import com.schoolapp.core.designsystem.component.InlineMessage
import com.schoolapp.core.designsystem.component.SecondaryButton
import com.schoolapp.core.designsystem.component.StatusTone
import com.schoolapp.core.designsystem.theme.AppColors
import com.schoolapp.core.model.inventory.InventoryItem
import com.schoolapp.core.ui.actionErrorMessage
import com.schoolapp.feature.inventory.R
import com.schoolapp.feature.inventory.components.LineEditor
import com.schoolapp.feature.inventory.components.LinePrice
import com.schoolapp.feature.inventory.components.SheetSubmitButton
import com.schoolapp.feature.inventory.components.TotalLine
import com.schoolapp.feature.inventory.components.toPickerOptions

@Composable
internal fun RequestSheet(state: RequestFormState, catalog: List<InventoryItem>, viewModel: RequestFormViewModel) {
    val options = catalog.toPickerOptions()
    AppBottomSheet(title = stringResource(R.string.inv_new_request), onDismiss = viewModel::dismiss) {
        Text(stringResource(R.string.inv_request_note), style = MaterialTheme.typography.bodyMedium, color = AppColors.TextSecondary)
        state.error?.let { InlineMessage(actionErrorMessage(it), StatusTone.Error) }
        state.lines.forEachIndexed { index, line ->
            LineEditor(
                index = index,
                line = line,
                options = options,
                price = LinePrice.Typed(R.string.inv_unit_price_est),
                onItem = { viewModel.onItem(line.key, it) },
                onQuantity = { viewModel.onQuantity(line.key, it) },
                onPrice = { viewModel.onPrice(line.key, it) },
                onRemove = if (state.lines.size > 1) ({ viewModel.removeLine(line.key) }) else null,
                enabled = !state.isSaving,
            )
        }
        state.linesError?.let { Text(stringResource(it), style = MaterialTheme.typography.bodySmall, color = AppColors.Error) }
        SecondaryButton(stringResource(R.string.inv_add_line), viewModel::addLine, leadingIcon = Icons.Outlined.Add, enabled = !state.isSaving)
        TotalLine(stringResource(R.string.inv_estimated_total), state.totalMinor, emphasis = true)
        AppTextArea(
            value = state.reason,
            onValueChange = viewModel::onReason,
            label = stringResource(R.string.inv_reason),
            supportingText = stringResource(R.string.inv_reason_hint),
            minLines = 2,
            errorText = state.reasonError?.let { stringResource(it) },
        )
        SheetSubmitButton(stringResource(R.string.inv_send_for_approval), viewModel::submit, state.isSaving)
    }
}
