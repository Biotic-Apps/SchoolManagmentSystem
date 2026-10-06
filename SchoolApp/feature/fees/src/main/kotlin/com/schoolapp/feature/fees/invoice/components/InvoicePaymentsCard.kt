package com.schoolapp.feature.fees.invoice.components

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.outlined.Download
import androidx.compose.material3.HorizontalDivider
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.unit.dp
import com.schoolapp.core.designsystem.component.AppCard
import com.schoolapp.core.designsystem.component.AppTextButton
import com.schoolapp.core.designsystem.component.InlineMessage
import com.schoolapp.core.designsystem.component.MoneyText
import com.schoolapp.core.designsystem.component.StatusTone
import com.schoolapp.core.designsystem.theme.AppColors
import com.schoolapp.core.model.fees.InvoicePayment
import com.schoolapp.core.ui.appErrorMessage
import com.schoolapp.core.ui.formatDate
import com.schoolapp.feature.fees.R
import com.schoolapp.feature.fees.invoice.ReceiptProblem

/** Payments against the invoice with a receipt button each; receipt problems show inline. */
@Composable
internal fun InvoicePaymentsCard(
    payments: List<InvoicePayment>,
    currency: String,
    busyPaymentId: String?,
    problem: ReceiptProblem?,
    onReceipt: (String) -> Unit,
    modifier: Modifier = Modifier,
) {
    AppCard(modifier = modifier) {
        Text(stringResource(R.string.fees_payments), style = MaterialTheme.typography.titleSmall, color = AppColors.TextSecondary)
        if (payments.isEmpty()) {
            Text(stringResource(R.string.fees_no_payments), style = MaterialTheme.typography.bodyMedium, color = AppColors.TextSecondary)
        }
        payments.forEachIndexed { index, payment ->
            if (index > 0) HorizontalDivider(color = AppColors.Border)
            Row(horizontalArrangement = Arrangement.spacedBy(12.dp), verticalAlignment = Alignment.CenterVertically) {
                Column(Modifier.weight(1f), verticalArrangement = Arrangement.spacedBy(2.dp)) {
                    Text(
                        payment.receiptNo ?: stringResource(R.string.fees_receipt_pending_no),
                        style = MaterialTheme.typography.bodyLarge,
                        color = AppColors.TextPrimary,
                    )
                    formatDate(payment.paidOn)?.let { Text(it, style = MaterialTheme.typography.bodySmall, color = AppColors.TextSecondary) }
                    AppTextButton(
                        text = stringResource(R.string.fees_receipt),
                        onClick = { onReceipt(payment.paymentId) },
                        enabled = busyPaymentId == null,
                        loading = busyPaymentId == payment.paymentId,
                        leadingIcon = Icons.Outlined.Download,
                    )
                }
                MoneyText(payment.amountMinor, currency = currency, style = MaterialTheme.typography.bodyLarge)
            }
        }
        when (problem) {
            null -> Unit
            ReceiptProblem.NotReady -> InlineMessage(stringResource(R.string.fees_receipt_not_ready), StatusTone.Info)
            is ReceiptProblem.Failed -> InlineMessage(appErrorMessage(problem.error), StatusTone.Error)
        }
    }
}
