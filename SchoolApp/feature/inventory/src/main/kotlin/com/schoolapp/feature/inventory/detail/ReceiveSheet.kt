package com.schoolapp.feature.inventory.detail

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.unit.dp
import com.schoolapp.core.designsystem.component.AppBottomSheet
import com.schoolapp.core.designsystem.component.AppCard
import com.schoolapp.core.designsystem.component.InlineMessage
import com.schoolapp.core.designsystem.component.StatusTone
import com.schoolapp.core.designsystem.theme.AppColors
import com.schoolapp.core.ui.actionErrorMessage
import com.schoolapp.feature.inventory.R
import com.schoolapp.feature.inventory.components.InventoryDateField
import com.schoolapp.feature.inventory.components.QuantityField
import com.schoolapp.feature.inventory.components.SheetSubmitButton

@Composable
internal fun ReceiveSheet(state: ReceiveFormState, viewModel: ReceiveFormViewModel) {
    AppBottomSheet(title = stringResource(R.string.inv_receive_title, state.poNo), onDismiss = viewModel::dismiss) {
        Text(stringResource(R.string.inv_receive_note), style = MaterialTheme.typography.bodyMedium, color = AppColors.TextSecondary)
        state.error?.let { InlineMessage(actionErrorMessage(it), StatusTone.Error) }
        InventoryDateField(
            date = state.receivedOn,
            label = stringResource(R.string.inv_received_on),
            onDateSelected = viewModel::onDate,
            maxDate = state.today,
            enabled = !state.isSaving,
        )
        state.lines.forEach { line ->
            AppCard {
                Row(Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.spacedBy(12.dp), verticalAlignment = Alignment.CenterVertically) {
                    Column(Modifier.weight(1f)) {
                        Text(line.name, style = MaterialTheme.typography.titleSmall, color = AppColors.TextPrimary)
                        Text(stringResource(R.string.inv_outstanding, line.outstanding), style = MaterialTheme.typography.bodySmall, color = AppColors.TextSecondary)
                    }
                    QuantityField(
                        value = line.quantity,
                        onValueChange = { viewModel.onQuantity(line.itemId, it) },
                        label = stringResource(R.string.inv_received),
                        errorText = line.error?.let { stringResource(it) },
                        enabled = !state.isSaving,
                        modifier = Modifier.weight(1f),
                    )
                }
            }
        }
        state.linesError?.let { Text(stringResource(it), style = MaterialTheme.typography.bodySmall, color = AppColors.Error) }
        SheetSubmitButton(stringResource(R.string.inv_receive_submit), viewModel::submit, state.isSaving)
    }
}
