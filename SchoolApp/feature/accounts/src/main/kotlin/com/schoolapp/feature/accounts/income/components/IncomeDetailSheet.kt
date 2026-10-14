package com.schoolapp.feature.accounts.income.components

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.outlined.Delete
import androidx.compose.material.icons.outlined.Edit
import androidx.compose.material.icons.outlined.Receipt
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.unit.dp
import com.schoolapp.core.common.result.AppError
import com.schoolapp.core.designsystem.component.AppBottomSheet
import com.schoolapp.core.designsystem.component.InlineMessage
import com.schoolapp.core.designsystem.component.KeyValueRow
import com.schoolapp.core.designsystem.component.MoneyRow
import com.schoolapp.core.designsystem.component.PrimaryButton
import com.schoolapp.core.designsystem.component.SecondaryButton
import com.schoolapp.core.designsystem.component.StatusTone
import com.schoolapp.core.designsystem.theme.AppColors
import com.schoolapp.core.model.accounts.Income
import com.schoolapp.core.ui.actionErrorMessage
import com.schoolapp.core.ui.formatDate
import com.schoolapp.core.ui.formatTimestamp
import com.schoolapp.core.ui.rememberExternalActions
import com.schoolapp.feature.accounts.R

/** Full income record with receipt link; edit and delete for `expenses.add` / `expenses.edit` holders. */
@Composable
internal fun IncomeDetailSheet(
    income: Income,
    categoryName: String?,
    canEdit: Boolean,
    deleting: Boolean,
    error: AppError?,
    onEdit: () -> Unit,
    onDelete: () -> Unit,
    onDismiss: () -> Unit,
) {
    val external = rememberExternalActions()
    AppBottomSheet(title = income.title, onDismiss = onDismiss) {
        error?.let { InlineMessage(actionErrorMessage(it), StatusTone.Error) }
        MoneyRow(label = stringResource(R.string.accounts_amount), amountMinor = income.amountMinor, currency = income.currency, emphasized = true)
        KeyValueRow(stringResource(R.string.accounts_category), categoryName)
        KeyValueRow(stringResource(R.string.accounts_received_on), formatDate(income.receivedOn))
        income.description?.let { KeyValueRow(stringResource(R.string.accounts_description), it) }
        income.notes?.let { KeyValueRow(stringResource(R.string.accounts_notes), it) }
        formatTimestamp(income.createdAt)?.let { KeyValueRow(stringResource(R.string.accounts_recorded_at), it) }
        val receipt = income.receiptUrl
        if (receipt != null) {
            SecondaryButton(
                text = stringResource(R.string.accounts_open_receipt),
                onClick = { external.open(receipt) },
                leadingIcon = Icons.Outlined.Receipt,
                modifier = Modifier.fillMaxWidth(),
            )
        }
        if (canEdit) {
            Row(Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.spacedBy(12.dp)) {
                SecondaryButton(
                    text = stringResource(R.string.accounts_delete),
                    onClick = onDelete,
                    loading = deleting,
                    enabled = !deleting,
                    leadingIcon = Icons.Outlined.Delete,
                    contentColor = AppColors.Error,
                    modifier = Modifier.weight(1f),
                )
                PrimaryButton(
                    text = stringResource(R.string.accounts_edit),
                    onClick = onEdit,
                    enabled = !deleting,
                    leadingIcon = Icons.Outlined.Edit,
                    modifier = Modifier.weight(1f),
                )
            }
        }
    }
}
