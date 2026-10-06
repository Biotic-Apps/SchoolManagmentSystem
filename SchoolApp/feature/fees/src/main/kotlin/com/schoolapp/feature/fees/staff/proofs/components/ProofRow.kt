package com.schoolapp.feature.fees.staff.proofs.components

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
import com.schoolapp.core.model.fees.PaymentProof
import com.schoolapp.core.ui.formatDate
import com.schoolapp.feature.fees.R
import com.schoolapp.feature.fees.components.label

/** Student, invoice, method/reference and paid-on date; amount right aligned. */
@Composable
internal fun ProofRow(proof: PaymentProof, currency: String, onClick: () -> Unit, modifier: Modifier = Modifier) {
    AppCard(modifier = modifier, onClick = onClick, contentPadding = 12.dp) {
        Row(horizontalArrangement = Arrangement.spacedBy(12.dp), verticalAlignment = Alignment.Top) {
            Column(Modifier.weight(1f), verticalArrangement = Arrangement.spacedBy(2.dp)) {
                Text(proof.studentName ?: stringResource(R.string.fees_unknown_student), style = MaterialTheme.typography.bodyLarge, color = AppColors.TextPrimary)
                proof.invoiceNo?.let { Text(it, style = MaterialTheme.typography.bodySmall, color = AppColors.TextSecondary) }
                Text(
                    listOfNotNull(proof.method.label(), proof.reference).joinToString(" · "),
                    style = MaterialTheme.typography.bodySmall,
                    color = AppColors.TextSecondary,
                )
                formatDate(proof.paidOn)?.let {
                    Text(stringResource(R.string.fees_paid_on_value, it), style = MaterialTheme.typography.bodySmall, color = AppColors.TextSecondary)
                }
            }
            MoneyText(proof.amountMinor, currency = currency, style = MaterialTheme.typography.bodyLarge, fontWeight = FontWeight.SemiBold)
        }
    }
}
