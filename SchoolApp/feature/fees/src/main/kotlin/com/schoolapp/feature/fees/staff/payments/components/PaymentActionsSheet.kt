package com.schoolapp.feature.fees.staff.payments.components

import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.outlined.Undo
import androidx.compose.material.icons.outlined.Receipt
import androidx.compose.material.icons.outlined.Replay
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.res.stringResource
import com.schoolapp.core.designsystem.component.AppBottomSheet
import com.schoolapp.core.designsystem.component.InlineMessage
import com.schoolapp.core.designsystem.component.KeyValueRow
import com.schoolapp.core.designsystem.component.MoneyRow
import com.schoolapp.core.designsystem.component.SecondaryButton
import com.schoolapp.core.designsystem.component.StatusTone
import com.schoolapp.core.designsystem.theme.AppColors
import com.schoolapp.core.ui.appErrorMessage
import com.schoolapp.core.ui.formatDate
import com.schoolapp.feature.fees.R
import com.schoolapp.feature.fees.components.label
import com.schoolapp.feature.fees.staff.payments.PaymentAction
import com.schoolapp.feature.fees.staff.payments.PaymentActionsUiState
import com.schoolapp.feature.fees.staff.payments.PaymentSheet

/** Payment details with Receipt, Refund and Reverse; each money action opens its own form. */
@Composable
internal fun PaymentActionsSheet(state: PaymentActionsUiState, sheet: PaymentSheet, actions: PaymentSheetActions) {
    val payment = sheet.payment
    val title = payment.receiptNo ?: stringResource(R.string.fees_payment_title)
    AppBottomSheet(title = title, onDismiss = actions.onDismiss) {
        MoneyRow(stringResource(R.string.fees_amount), payment.amountMinor, currency = payment.currency, emphasized = true)
        KeyValueRow(stringResource(R.string.fees_student), payment.studentName)
        KeyValueRow(stringResource(R.string.fees_method), payment.method.label())
        KeyValueRow(stringResource(R.string.fees_reference), payment.reference)
        KeyValueRow(stringResource(R.string.fees_received_on), formatDate(payment.receivedOn))
        KeyValueRow(stringResource(R.string.fees_cashier), payment.cashierName)
        if (!payment.isActive) InlineMessage(stringResource(R.string.fees_payment_reversal_state), StatusTone.Warning)
        sheet.error?.let { InlineMessage(appErrorMessage(it), StatusTone.Error) }
        when (sheet.action) {
            null -> {
                SecondaryButton(
                    stringResource(R.string.fees_download_receipt),
                    actions.onReceipt,
                    Modifier.fillMaxWidth(),
                    loading = sheet.isOpeningReceipt,
                    leadingIcon = Icons.Outlined.Receipt,
                )
                if (state.canRefund && payment.isActive) {
                    SecondaryButton(
                        stringResource(R.string.fees_refund),
                        { actions.onChoose(PaymentAction.REFUND) },
                        Modifier.fillMaxWidth(),
                        leadingIcon = Icons.AutoMirrored.Outlined.Undo,
                    )
                }
                if (state.canReverse && payment.isActive) {
                    SecondaryButton(
                        stringResource(R.string.fees_reverse_payment),
                        { actions.onChoose(PaymentAction.REVERSE) },
                        Modifier.fillMaxWidth(),
                        leadingIcon = Icons.Outlined.Replay,
                        contentColor = AppColors.Error,
                    )
                }
            }
            PaymentAction.REVERSE -> ReverseForm(sheet, actions)
            PaymentAction.REFUND -> RefundForm(sheet, actions)
        }
    }
}
