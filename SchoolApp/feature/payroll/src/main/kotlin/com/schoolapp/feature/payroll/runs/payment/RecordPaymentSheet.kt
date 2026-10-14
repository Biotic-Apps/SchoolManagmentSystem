package com.schoolapp.feature.payroll.runs.payment

import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.outlined.Check
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.res.stringResource
import androidx.compose.foundation.layout.fillMaxWidth
import com.schoolapp.core.designsystem.component.AppBottomSheet
import com.schoolapp.core.designsystem.component.AppDatePickerDialog
import com.schoolapp.core.designsystem.component.AppTextField
import com.schoolapp.core.designsystem.component.InlineMessage
import com.schoolapp.core.designsystem.component.MoneyField
import com.schoolapp.core.designsystem.component.MoneyRow
import com.schoolapp.core.designsystem.component.PickerField
import com.schoolapp.core.designsystem.component.PrimaryButton
import com.schoolapp.core.designsystem.component.StatusTone
import com.schoolapp.core.designsystem.money.MoneyFormat
import com.schoolapp.core.designsystem.theme.AppColors
import com.schoolapp.core.model.payroll.PayrollLine
import com.schoolapp.core.model.payroll.SalaryPaymentMethod
import com.schoolapp.core.ui.appErrorMessage
import com.schoolapp.core.ui.formatDate
import com.schoolapp.feature.payroll.R

/** Salary payment for one line: net / paid / balance, amount (≤ balance), paid-on date, method and reference. */
@Composable
internal fun RecordPaymentSheet(
    line: PayrollLine,
    form: PaymentForm,
    issues: Set<PaymentIssue>,
    currency: String,
    today: String,
    callbacks: PaymentCallbacks,
) {
    var pickingDate by remember { mutableStateOf(false) }
    AppBottomSheet(title = stringResource(R.string.payroll_payment_title, line.name), onDismiss = callbacks.onDismiss) {
        Text(stringResource(R.string.payroll_payment_hint), style = MaterialTheme.typography.bodyMedium, color = AppColors.TextSecondary)
        MoneyRow(stringResource(R.string.payroll_net), line.netMinor, currency = currency)
        MoneyRow(stringResource(R.string.payroll_paid), line.paidMinor, currency = currency)
        MoneyRow(stringResource(R.string.payroll_balance), line.balanceMinor, currency = currency, emphasized = true)
        form.error?.let { InlineMessage(appErrorMessage(it), StatusTone.Error) }
        MoneyField(
            value = form.amount,
            onValueChange = callbacks.onAmount,
            label = stringResource(R.string.payroll_payment_amount),
            currency = currency,
            errorText = amountError(issues, line.balanceMinor, currency),
            modifier = Modifier.fillMaxWidth(),
        )
        PickerField(
            value = formatDate(form.paidOn).orEmpty(),
            label = stringResource(R.string.payroll_payment_paid_on),
            onClick = { pickingDate = true },
            errorText = when {
                PaymentIssue.DATE_REQUIRED in issues -> stringResource(R.string.payroll_error_date_required)
                PaymentIssue.DATE_IN_FUTURE in issues -> stringResource(R.string.payroll_error_date_future)
                else -> null
            },
            modifier = Modifier.fillMaxWidth(),
        )
        MethodChoice(form.method, callbacks.onMethod, showError = PaymentIssue.METHOD_REQUIRED in issues)
        AppTextField(
            value = form.reference,
            onValueChange = callbacks.onReference,
            label = stringResource(R.string.payroll_payment_reference),
            supportingText = stringResource(R.string.payroll_payment_reference_hint),
            errorText = if (PaymentIssue.REFERENCE_TOO_LONG in issues) {
                stringResource(R.string.payroll_error_reference_long, PaymentValidator.REFERENCE_MAX)
            } else {
                null
            },
            modifier = Modifier.fillMaxWidth(),
        )
        PrimaryButton(
            text = stringResource(R.string.payroll_record_payment),
            onClick = callbacks.onSubmit,
            loading = form.saving,
            leadingIcon = Icons.Outlined.Check,
            modifier = Modifier.fillMaxWidth(),
        )
    }
    if (pickingDate) {
        AppDatePickerDialog(
            initialDate = form.paidOn,
            onConfirm = {
                callbacks.onPaidOn(it)
                pickingDate = false
            },
            onDismiss = { pickingDate = false },
            maxDate = today,
        )
    }
}

@Composable
private fun amountError(issues: Set<PaymentIssue>, balanceMinor: Long, currency: String): String? = when {
    PaymentIssue.AMOUNT_REQUIRED in issues -> stringResource(R.string.payroll_error_amount_required)
    PaymentIssue.AMOUNT_INVALID in issues -> stringResource(R.string.payroll_error_amount_invalid)
    PaymentIssue.AMOUNT_NOT_POSITIVE in issues -> stringResource(R.string.payroll_error_amount_positive)
    PaymentIssue.AMOUNT_OVER_BALANCE in issues ->
        stringResource(R.string.payroll_error_amount_over_balance, MoneyFormat.format(balanceMinor, currency))
    else -> null
}

/** Payment sheet callbacks, wired to the view model by the tab. */
internal class PaymentCallbacks(
    val onAmount: (String) -> Unit,
    val onPaidOn: (String) -> Unit,
    val onMethod: (SalaryPaymentMethod) -> Unit,
    val onReference: (String) -> Unit,
    val onSubmit: () -> Unit,
    val onDismiss: () -> Unit,
)
