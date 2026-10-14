package com.schoolapp.feature.expenses.detail

import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.saveable.rememberSaveable
import androidx.compose.runtime.setValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.text.input.ImeAction
import com.schoolapp.core.designsystem.component.AppBottomSheet
import com.schoolapp.core.designsystem.component.AppDatePickerDialog
import com.schoolapp.core.designsystem.component.AppTextField
import com.schoolapp.core.designsystem.component.FieldKind
import com.schoolapp.core.designsystem.component.FilterChipRow
import com.schoolapp.core.designsystem.component.InlineMessage
import com.schoolapp.core.designsystem.component.MoneyField
import com.schoolapp.core.designsystem.component.PickerField
import com.schoolapp.core.designsystem.component.PrimaryButton
import com.schoolapp.core.designsystem.component.StatusTone
import com.schoolapp.core.designsystem.component.SwitcherOption
import com.schoolapp.core.designsystem.money.MoneyFormat
import com.schoolapp.core.designsystem.theme.AppColors
import com.schoolapp.core.model.expenses.ExpensePaymentMethod
import com.schoolapp.core.ui.actionErrorMessage
import com.schoolapp.core.ui.formatDate
import com.schoolapp.feature.expenses.R
import com.schoolapp.feature.expenses.common.labelRes

internal class PaymentSheetActions(
    val onAmount: (String) -> Unit,
    val onMethod: (ExpensePaymentMethod) -> Unit,
    val onDate: (String) -> Unit,
    val onReference: (String) -> Unit,
    val onSave: () -> Unit,
    val onDismiss: () -> Unit,
)

/** Records a full or part payment; the bill becomes PAID once the balance is settled. */
@Composable
internal fun PaymentSheet(form: PaymentFormState, balanceMinor: Long, actions: PaymentSheetActions) {
    var pickingDate by rememberSaveable { mutableStateOf(false) }
    AppBottomSheet(title = stringResource(R.string.expenses_record_payment), onDismiss = actions.onDismiss) {
        Text(
            stringResource(R.string.expenses_outstanding, MoneyFormat.format(balanceMinor)),
            style = MaterialTheme.typography.bodyMedium,
            color = AppColors.TextSecondary,
        )
        form.error?.let { InlineMessage(actionErrorMessage(it), StatusTone.Error) }
        MoneyField(
            value = form.amount,
            onValueChange = actions.onAmount,
            label = stringResource(R.string.expenses_field_amount),
            errorText = paymentErrorText(form.amountError),
            supportingText = stringResource(R.string.expenses_part_payment_hint),
            modifier = Modifier.fillMaxWidth(),
        )
        Text(stringResource(R.string.expenses_field_method), style = MaterialTheme.typography.labelLarge, color = AppColors.TextSecondary)
        FilterChipRow(
            options = ExpensePaymentMethod.entries.map { SwitcherOption(it.name, stringResource(it.labelRes())) },
            selectedId = form.method.name,
            onSelect = { id -> ExpensePaymentMethod.entries.firstOrNull { it.name == id }?.let(actions.onMethod) },
        )
        PickerField(
            value = formatDate(form.paidOn).orEmpty(),
            label = stringResource(R.string.expenses_field_paid_on),
            onClick = { pickingDate = true },
            modifier = Modifier.fillMaxWidth(),
        )
        AppTextField(
            value = form.reference,
            onValueChange = actions.onReference,
            label = stringResource(R.string.expenses_field_reference),
            placeholder = stringResource(R.string.expenses_field_reference_placeholder),
            kind = FieldKind.Code,
            errorText = paymentErrorText(form.referenceError),
            imeAction = ImeAction.Done,
            onImeAction = actions.onSave,
            modifier = Modifier.fillMaxWidth(),
        )
        PrimaryButton(
            text = stringResource(R.string.expenses_record_payment),
            onClick = actions.onSave,
            loading = form.isSaving,
            modifier = Modifier.fillMaxWidth(),
        )
    }
    if (pickingDate) {
        AppDatePickerDialog(
            initialDate = form.paidOn,
            onConfirm = {
                actions.onDate(it)
                pickingDate = false
            },
            onDismiss = { pickingDate = false },
        )
    }
}

@Composable
private fun paymentErrorText(error: PaymentError?): String? = when (error) {
    null -> null
    PaymentError.AMOUNT_REQUIRED -> stringResource(R.string.expenses_error_required)
    PaymentError.AMOUNT_INVALID -> stringResource(R.string.expenses_error_amount)
    PaymentError.AMOUNT_OVER_BALANCE -> stringResource(R.string.expenses_error_over_balance)
    PaymentError.REFERENCE_TOO_LONG -> stringResource(R.string.expenses_error_too_long)
}
