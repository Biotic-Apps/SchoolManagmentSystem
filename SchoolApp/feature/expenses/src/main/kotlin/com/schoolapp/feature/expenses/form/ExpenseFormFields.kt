package com.schoolapp.feature.expenses.form

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.outlined.Close
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.unit.dp
import com.schoolapp.core.designsystem.component.AppTextButton
import com.schoolapp.core.designsystem.component.CreatablePickerField
import com.schoolapp.core.designsystem.component.PickerField
import com.schoolapp.core.designsystem.component.PickerOption
import com.schoolapp.core.designsystem.component.SwitchRow
import com.schoolapp.core.ui.formatDate
import com.schoolapp.feature.expenses.R
import com.schoolapp.feature.expenses.common.formatMonth

@Composable
internal fun ExpenseLookupFields(state: ExpenseFormUiState, callbacks: ExpenseFormCallbacks) {
    Column(verticalArrangement = Arrangement.spacedBy(12.dp)) {
        CreatablePickerField(
            label = stringResource(R.string.expenses_field_category),
            options = state.categories.map { PickerOption(it.id, it.name, it.code) },
            selectedId = state.categoryId,
            onSelect = callbacks.onCategoryChange,
            onCreate = if (state.canCreateLookups) callbacks.onCreateCategory else null,
            createLabel = { stringResource(R.string.expenses_create_category_named, it) },
            enabled = !state.isBusy,
            errorText = expenseErrorText(state.errors[ExpenseField.CATEGORY]),
            fallbackValue = state.categoryFallback,
            modifier = Modifier.fillMaxWidth(),
        )
        CreatablePickerField(
            label = stringResource(R.string.expenses_field_vendor),
            options = state.vendors.map { PickerOption(it.id, it.name, it.contactPerson ?: it.phone) },
            selectedId = state.vendorId,
            onSelect = callbacks.onVendorChange,
            noneLabel = if (state.vendorLocked) null else stringResource(R.string.expenses_no_vendor),
            onCreate = if (state.canCreateLookups) callbacks.onCreateVendor else null,
            createLabel = { stringResource(R.string.expenses_create_vendor_named, it) },
            enabled = !state.isBusy,
            fallbackValue = state.vendorFallback,
            modifier = Modifier.fillMaxWidth(),
        )
    }
}

@Composable
internal fun ExpenseDateFields(state: ExpenseFormUiState, onPick: (FormDate) -> Unit, onClearDue: () -> Unit) {
    Column(verticalArrangement = Arrangement.spacedBy(4.dp)) {
        Row(horizontalArrangement = Arrangement.spacedBy(12.dp)) {
            PickerField(
                value = formatDate(state.billDate).orEmpty(),
                label = stringResource(R.string.expenses_field_bill_date),
                onClick = { onPick(FormDate.BILL) },
                errorText = expenseErrorText(state.errors[ExpenseField.BILL_DATE]),
                modifier = Modifier.weight(1f),
            )
            PickerField(
                value = formatDate(state.dueDate) ?: stringResource(R.string.expenses_none),
                label = stringResource(R.string.expenses_field_due_date),
                onClick = { onPick(FormDate.DUE) },
                errorText = expenseErrorText(state.errors[ExpenseField.DUE_DATE]),
                modifier = Modifier.weight(1f),
            )
        }
        // The API keeps a saved due date when the field is left out, so clearing is offered for new bills only.
        if (state.dueDate != null && !state.isEditing) {
            AppTextButton(stringResource(R.string.expenses_clear_due_date), onClick = onClearDue, leadingIcon = Icons.Outlined.Close)
        }
    }
}

@Composable
internal fun ExpenseRecurringFields(state: ExpenseFormUiState, callbacks: ExpenseFormCallbacks, onPickUntil: () -> Unit) {
    Column(verticalArrangement = Arrangement.spacedBy(8.dp)) {
        SwitchRow(
            title = stringResource(R.string.expenses_field_recurring),
            supporting = stringResource(
                if (state.recurringLocked && state.recurringMonthly) R.string.expenses_recurring_locked else R.string.expenses_recurring_hint,
            ),
            checked = state.recurringMonthly,
            onCheckedChange = callbacks.onRecurringChange,
            enabled = !state.recurringLocked && !state.isSaving,
        )
        if (state.recurringMonthly) {
            Row(verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                PickerField(
                    value = formatMonth(state.recurringUntil) ?: stringResource(R.string.expenses_until_stopped),
                    label = stringResource(R.string.expenses_field_until),
                    onClick = onPickUntil,
                    errorText = expenseErrorText(state.errors[ExpenseField.UNTIL]),
                    modifier = Modifier.weight(1f),
                )
                if (state.recurringUntil != null) {
                    AppTextButton(stringResource(R.string.expenses_clear), onClick = { callbacks.onUntilChange(null) })
                }
            }
        }
    }
}

@Composable
internal fun expenseErrorText(error: ExpenseFieldError?): String? = when (error) {
    null -> null
    ExpenseFieldError.REQUIRED -> stringResource(R.string.expenses_error_required)
    ExpenseFieldError.TOO_SHORT -> stringResource(R.string.expenses_error_too_short, MIN_TITLE)
    ExpenseFieldError.TOO_LONG -> stringResource(R.string.expenses_error_too_long)
    ExpenseFieldError.INVALID_AMOUNT -> stringResource(R.string.expenses_error_amount)
    ExpenseFieldError.DUE_BEFORE_BILL -> stringResource(R.string.expenses_error_due_before_bill)
    ExpenseFieldError.UNTIL_BEFORE_BILL -> stringResource(R.string.expenses_error_until_before_bill)
}
