package com.schoolapp.feature.accounts.income.components

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.outlined.AttachFile
import androidx.compose.material.icons.outlined.Savings
import androidx.compose.material3.Icon
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import com.schoolapp.core.designsystem.component.AppCard
import com.schoolapp.core.designsystem.component.IconTile
import com.schoolapp.core.designsystem.component.MoneyText
import com.schoolapp.core.designsystem.component.StatusTone
import com.schoolapp.core.designsystem.theme.AppColors
import com.schoolapp.core.model.accounts.Income
import com.schoolapp.core.ui.formatDate
import com.schoolapp.feature.accounts.R

/** One income record: title, category, date received, amount and a receipt marker. */
@Composable
internal fun IncomeCard(income: Income, categoryName: String?, onClick: () -> Unit, modifier: Modifier = Modifier) {
    AppCard(modifier = modifier.fillMaxWidth(), onClick = onClick) {
        Row(horizontalArrangement = Arrangement.spacedBy(12.dp), verticalAlignment = Alignment.CenterVertically) {
            IconTile(Icons.Outlined.Savings, StatusTone.Success)
            Column(Modifier.weight(1f), verticalArrangement = Arrangement.spacedBy(2.dp)) {
                Text(
                    income.title,
                    style = MaterialTheme.typography.titleMedium,
                    color = AppColors.TextPrimary,
                    maxLines = 2,
                    overflow = TextOverflow.Ellipsis,
                )
                val meta = listOfNotNull(categoryName, formatDate(income.receivedOn)).joinToString(" · ")
                Text(meta, style = MaterialTheme.typography.bodySmall, color = AppColors.TextSecondary)
                income.description?.let {
                    Text(it, style = MaterialTheme.typography.bodySmall, color = AppColors.TextSecondary, maxLines = 1, overflow = TextOverflow.Ellipsis)
                }
            }
            Column(horizontalAlignment = Alignment.End, verticalArrangement = Arrangement.spacedBy(4.dp)) {
                MoneyText(income.amountMinor, currency = income.currency, style = MaterialTheme.typography.titleMedium, fontWeight = FontWeight.SemiBold)
                if (income.receiptFileId != null) {
                    Icon(
                        Icons.Outlined.AttachFile,
                        contentDescription = stringResource(R.string.accounts_has_receipt),
                        tint = AppColors.TextSecondary,
                    )
                }
            }
        }
    }
}
