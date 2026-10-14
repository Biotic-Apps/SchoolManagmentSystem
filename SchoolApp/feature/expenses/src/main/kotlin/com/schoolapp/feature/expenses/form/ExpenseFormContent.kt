package com.schoolapp.feature.expenses.form

import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.saveable.rememberSaveable
import androidx.compose.runtime.setValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.unit.dp
import com.schoolapp.core.designsystem.component.AppDatePickerDialog
import com.schoolapp.core.designsystem.component.AppTextArea
import com.schoolapp.core.designsystem.component.AppTextField
import com.schoolapp.core.designsystem.component.InlineMessage
import com.schoolapp.core.designsystem.component.MoneyField
import com.schoolapp.core.designsystem.component.PrimaryButton
import com.schoolapp.core.designsystem.component.ScreenColumn
import com.schoolapp.core.designsystem.component.StatusTone
import com.schoolapp.core.model.files.AttachmentDraft
import com.schoolapp.core.ui.actionErrorMessage
import com.schoolapp.core.ui.attachments.AttachmentsField
import com.schoolapp.feature.expenses.R

internal class ExpenseFormCallbacks(
    val onTitleChange: (String) -> Unit,
    val onCategoryChange: (String?) -> Unit,
    val onCreateCategory: (String) -> Unit,
    val onVendorChange: (String?) -> Unit,
    val onCreateVendor: (String) -> Unit,
    val onAmountChange: (String) -> Unit,
    val onBillDateChange: (String) -> Unit,
    val onDueDateChange: (String?) -> Unit,
    val onBillPicked: (String) -> Unit,
    val onRemoveBill: (String) -> Unit,
    val onRecurringChange: (Boolean) -> Unit,
    val onUntilChange: (String?) -> Unit,
    val onNotesChange: (String) -> Unit,
    val onSave: () -> Unit,
)

internal enum class FormDate { BILL, DUE, UNTIL }

/** Title, category, vendor, amount, dates, bill copy, monthly repeat and notes. */
@Composable
internal fun ExpenseFormContent(state: ExpenseFormUiState, callbacks: ExpenseFormCallbacks, modifier: Modifier = Modifier) {
    var picking by rememberSaveable { mutableStateOf<FormDate?>(null) }
    ScreenColumn(modifier = modifier, contentPadding = PaddingValues(16.dp), itemSpacing = 12.dp) {
        state.error?.let { error -> item(key = "error") { InlineMessage(actionErrorMessage(error), StatusTone.Error) } }
        item(key = "title") {
            AppTextField(
                value = state.title,
                onValueChange = callbacks.onTitleChange,
                label = stringResource(R.string.expenses_field_title),
                placeholder = stringResource(R.string.expenses_field_title_placeholder),
                errorText = expenseErrorText(state.errors[ExpenseField.TITLE]),
                modifier = Modifier.fillMaxWidth(),
            )
        }
        item(key = "lookups") { ExpenseLookupFields(state, callbacks) }
        item(key = "amount") {
            MoneyField(
                value = state.amount,
                onValueChange = callbacks.onAmountChange,
                label = stringResource(R.string.expenses_field_amount),
                errorText = expenseErrorText(state.errors[ExpenseField.AMOUNT]),
                modifier = Modifier.fillMaxWidth(),
            )
        }
        item(key = "dates") { ExpenseDateFields(state, onPick = { picking = it }, onClearDue = { callbacks.onDueDateChange(null) }) }
        item(key = "bill") {
            AttachmentsField(
                draft = AttachmentDraft(items = listOfNotNull(state.billFile), uploading = if (state.isUploading) 1 else 0),
                onPicked = callbacks.onBillPicked,
                onRemove = callbacks.onRemoveBill,
                label = stringResource(R.string.expenses_field_bill),
                max = 1,
                enabled = !state.isSaving,
            )
        }
        item(key = "recurring") { ExpenseRecurringFields(state, callbacks, onPickUntil = { picking = FormDate.UNTIL }) }
        item(key = "notes") {
            AppTextArea(
                value = state.notes,
                onValueChange = callbacks.onNotesChange,
                label = stringResource(R.string.expenses_field_notes),
                errorText = expenseErrorText(state.errors[ExpenseField.NOTES]),
                modifier = Modifier.fillMaxWidth(),
            )
        }
        item(key = "save") {
            PrimaryButton(
                text = stringResource(if (state.isEditing) R.string.expenses_save_changes else R.string.expenses_save_draft),
                onClick = callbacks.onSave,
                loading = state.isSaving,
                enabled = !state.isUploading && !state.creatingLookup,
                modifier = Modifier.fillMaxWidth(),
            )
        }
    }
    picking?.let { target ->
        AppDatePickerDialog(
            initialDate = when (target) {
                FormDate.BILL -> state.billDate
                FormDate.DUE -> state.dueDate ?: state.billDate
                FormDate.UNTIL -> state.recurringUntil?.let { "$it-01" } ?: state.billDate
            },
            onConfirm = { date ->
                when (target) {
                    FormDate.BILL -> callbacks.onBillDateChange(date)
                    FormDate.DUE -> callbacks.onDueDateChange(date)
                    FormDate.UNTIL -> callbacks.onUntilChange(date.take(MONTH_LENGTH))
                }
                picking = null
            },
            onDismiss = { picking = null },
            minDate = if (target == FormDate.BILL) null else state.billDate.takeIf { it.isNotBlank() },
        )
    }
}

private const val MONTH_LENGTH = 7
