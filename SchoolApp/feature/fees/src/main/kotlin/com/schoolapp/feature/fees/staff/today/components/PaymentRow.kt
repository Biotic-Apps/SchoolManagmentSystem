package com.schoolapp.feature.fees.staff.today.components

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import com.schoolapp.core.designsystem.component.AppCard
import com.schoolapp.core.designsystem.component.MoneyText
import com.schoolapp.core.designsystem.theme.AppColors
import com.schoolapp.core.model.fees.Payment
import com.schoolapp.feature.fees.R
import com.schoolapp.feature.fees.components.label

/** Receipt number, student, method and cashier; amount right aligned. */
@Composable
internal fun PaymentRow(payment: Payment, currency: String, modifier: Modifier = Modifier) {
    AppCard(modifier = modifier, contentPadding = 12.dp) {
        Row(horizontalArrangement = Arrangement.spacedBy(12.dp), verticalAlignment = Alignment.Top) {
            Column(Modifier.weight(1f), verticalArrangement = Arrangement.spacedBy(2.dp)) {
                Text(
                    payment.studentName ?: stringResource(R.string.fees_unknown_student),
                    style = MaterialTheme.typography.bodyLarge,
                    color = AppColors.TextPrimary,
                )
                Text(
                    listOfNotNull(payment.receiptNo ?: stringResource(R.string.fees_receipt_pending_no), payment.method.label()).joinToString(" · "),
                    style = MaterialTheme.typography.bodySmall,
                    color = AppColors.TextSecondary,
                )
                payment.cashierName?.let {
                    Text(stringResource(R.string.fees_received_by, it), style = MaterialTheme.typography.bodySmall, color = AppColors.TextSecondary)
                }
            }
            MoneyText(payment.amountMinor, currency = currency, style = MaterialTheme.typography.bodyLarge, fontWeight = FontWeight.SemiBold)
        }
    }
}
