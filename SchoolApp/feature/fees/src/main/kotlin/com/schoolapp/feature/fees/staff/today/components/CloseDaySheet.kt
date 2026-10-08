package com.schoolapp.feature.fees.staff.today.components

import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.text.input.ImeAction
import com.schoolapp.core.designsystem.component.AppBottomSheet
import com.schoolapp.core.designsystem.component.AppTextArea
import com.schoolapp.core.designsystem.component.ConfirmDialog
import com.schoolapp.core.designsystem.component.InlineMessage
import com.schoolapp.core.designsystem.component.MoneyField
import com.schoolapp.core.designsystem.component.MoneyRow
import com.schoolapp.core.designsystem.component.PrimaryButton
import com.schoolapp.core.designsystem.component.StatusTone
import com.schoolapp.core.designsystem.money.MoneyFormat
import com.schoolapp.core.designsystem.theme.AppColors
import com.schoolapp.core.ui.appErrorMessage
import com.schoolapp.core.ui.formatDate
import com.schoolapp.feature.fees.R
import com.schoolapp.feature.fees.staff.payments.PaymentActionRules
import com.schoolapp.feature.fees.staff.today.CloseDayForm

internal class CloseDayActions(
    val onCashChange: (String) -> Unit,
    val onNoteChange: (String) -> Unit,
    val onSubmit: () -> Unit,
    val onConfirm: () -> Unit,
    val onCancelConfirm: () -> Unit,
    val onDismiss: () -> Unit,
)

/** Count the drawer: expected vs counted cash, difference, note (web `CloseDayDialog`). */
@Composable
internal fun CloseDaySheet(form: CloseDayForm, date: String, expectedCashMinor: Long, currency: String, actions: CloseDayActions) {
    val dateLabel = formatDate(date) ?: date
    AppBottomSheet(title = stringResource(R.string.fees_close_day_title, dateLabel), onDismiss = actions.onDismiss) {
        Text(stringResource(R.string.fees_close_day_help), style = MaterialTheme.typography.bodyMedium, color = AppColors.TextSecondary)
        MoneyField(
            value = form.cash,
            onValueChange = actions.onCashChange,
            label = stringResource(R.string.fees_cash_counted),
            currency = currency,
            errorText = if (form.cashInvalid) stringResource(R.string.fees_amount_invalid) else null,
            enabled = !form.isSaving,
            imeAction = ImeAction.Next,
        )
        MoneyRow(stringResource(R.string.fees_expected_cash), expectedCashMinor, currency = currency)
        val counted = PaymentActionRules.cashCounted(form.cash)
        if (counted != null) MoneyRow(stringResource(R.string.fees_cash_difference), counted - expectedCashMinor, currency = currency)
        AppTextArea(
            value = form.note,
            onValueChange = actions.onNoteChange,
            label = stringResource(R.string.fees_close_note),
            supportingText = stringResource(R.string.fees_close_note_help),
            enabled = !form.isSaving,
        )
        form.error?.let { InlineMessage(appErrorMessage(it), StatusTone.Error) }
        PrimaryButton(stringResource(R.string.fees_close_day), actions.onSubmit, Modifier.fillMaxWidth(), loading = form.isSaving)
    }
    if (form.confirming) {
        ConfirmDialog(
            title = stringResource(R.string.fees_close_day_confirm_title, dateLabel),
            message = stringResource(
                R.string.fees_close_day_confirm_message,
                MoneyFormat.format(counted(form), currency),
                MoneyFormat.format(expectedCashMinor, currency),
            ),
            confirmLabel = stringResource(R.string.fees_close_day),
            onConfirm = actions.onConfirm,
            onDismiss = actions.onCancelConfirm,
        )
    }
}

private fun counted(form: CloseDayForm): Long = PaymentActionRules.cashCounted(form.cash) ?: 0
