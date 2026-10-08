package com.schoolapp.feature.fees.staff.payments

import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.ui.res.stringResource
import com.schoolapp.core.designsystem.component.ConfirmDialog
import com.schoolapp.core.designsystem.money.MoneyFormat
import com.schoolapp.feature.fees.R
import com.schoolapp.feature.fees.staff.payments.components.PaymentActionsSheet
import com.schoolapp.feature.fees.staff.payments.components.PaymentSheetActions

/** Shows the payment sheet and the money confirmation; opens receipt urls through [onOpenUrl]. */
@Composable
internal fun PaymentActionsHost(viewModel: PaymentActionsViewModel, state: PaymentActionsUiState, onOpenUrl: (String) -> Unit) {
    val url = state.openUrl
    LaunchedEffect(url) {
        if (url != null) {
            onOpenUrl(url)
            viewModel.onUrlOpened()
        }
    }
    val sheet = state.sheet ?: return
    val actions = PaymentSheetActions(
        onDismiss = viewModel::dismiss,
        onChoose = viewModel::choose,
        onReceipt = viewModel::openReceipt,
        onReasonChange = viewModel::onReasonChange,
        onAmountChange = viewModel::onAmountChange,
        onMethodChange = viewModel::onMethodChange,
        onSubmit = viewModel::submit,
        onConfirm = viewModel::confirm,
        onCancelConfirm = viewModel::cancelConfirm,
    )
    PaymentActionsSheet(state, sheet, actions)
    if (sheet.confirming) {
        val receipt = sheet.payment.receiptNo.orEmpty()
        val reverse = sheet.action == PaymentAction.REVERSE
        val amountMinor = if (reverse) sheet.payment.amountMinor else MoneyFormat.parse(sheet.amount) ?: 0
        val amount = MoneyFormat.format(amountMinor, sheet.payment.currency)
        ConfirmDialog(
            title = stringResource(if (reverse) R.string.fees_reverse_confirm_title else R.string.fees_refund_confirm_title, receipt),
            message = stringResource(if (reverse) R.string.fees_reverse_confirm_message else R.string.fees_refund_confirm_message, amount),
            confirmLabel = stringResource(R.string.fees_send_for_approval),
            onConfirm = actions.onConfirm,
            onDismiss = actions.onCancelConfirm,
            destructive = reverse,
        )
    }
}
