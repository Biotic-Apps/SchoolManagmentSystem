package com.schoolapp.feature.fees.parent.components

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
import com.schoolapp.core.designsystem.component.StatusChip
import com.schoolapp.core.designsystem.theme.AppColors
import com.schoolapp.core.model.fees.PaymentProof
import com.schoolapp.core.model.fees.ProofStatus
import com.schoolapp.core.ui.formatDate
import com.schoolapp.feature.fees.R
import com.schoolapp.feature.fees.components.label
import com.schoolapp.feature.fees.components.tone

/** A submitted payment proof with its status; a rejected one shows the school's reason. */
@Composable
internal fun ParentProofRow(proof: PaymentProof, currency: String, modifier: Modifier = Modifier) {
    AppCard(modifier = modifier, contentPadding = 12.dp) {
        Row(horizontalArrangement = Arrangement.spacedBy(12.dp), verticalAlignment = Alignment.Top) {
            Column(Modifier.weight(1f), verticalArrangement = Arrangement.spacedBy(2.dp)) {
                Text(proof.invoiceNo ?: stringResource(R.string.fees_invoice), style = MaterialTheme.typography.bodyLarge, color = AppColors.TextPrimary)
                val details = listOfNotNull(proof.method.label(), proof.reference, formatDate(proof.paidOn)).joinToString(" · ")
                Text(details, style = MaterialTheme.typography.bodySmall, color = AppColors.TextSecondary)
            }
            MoneyText(proof.amountMinor, currency = currency, style = MaterialTheme.typography.bodyLarge, fontWeight = FontWeight.SemiBold)
        }
        StatusChip(proof.status.label(), proof.status.tone())
        val reason = proof.reason
        if (proof.status == ProofStatus.REJECTED && reason != null) {
            Text(stringResource(R.string.fees_proof_rejected_reason, reason), style = MaterialTheme.typography.bodyMedium, color = AppColors.Error)
        }
    }
}
