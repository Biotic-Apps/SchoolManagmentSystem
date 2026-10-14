package com.schoolapp.feature.fees.staff.dues.components

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.selection.toggleable
import androidx.compose.material3.Checkbox
import androidx.compose.material3.CheckboxDefaults
import androidx.compose.material3.HorizontalDivider
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.res.pluralStringResource
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.semantics.Role
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.outlined.ReceiptLong
import com.schoolapp.core.designsystem.component.AppCard
import com.schoolapp.core.designsystem.component.AppTextButton
import com.schoolapp.core.designsystem.component.MoneyText
import com.schoolapp.core.designsystem.theme.AppColors
import com.schoolapp.core.model.fees.DuesAging
import com.schoolapp.core.model.fees.DuesRow
import com.schoolapp.feature.fees.R
import com.schoolapp.feature.fees.components.classLabel

/** Student, class and balance; aging buckets as four right-aligned columns. */
@Composable
internal fun DuesRowCard(
    row: DuesRow,
    currency: String,
    modifier: Modifier = Modifier,
    selected: Boolean? = null,
    onToggle: () -> Unit = {},
    onOpenLedger: (() -> Unit)? = null,
) {
    val selectable = if (selected != null) {
        Modifier.toggleable(value = selected, role = Role.Checkbox, onValueChange = { onToggle() })
    } else {
        Modifier
    }
    AppCard(modifier = modifier, contentPadding = 12.dp) {
        Row(selectable, horizontalArrangement = Arrangement.spacedBy(12.dp), verticalAlignment = Alignment.Top) {
            if (selected != null) {
                Checkbox(checked = selected, onCheckedChange = null, colors = CheckboxDefaults.colors(checkedColor = AppColors.Primary))
            }
            Column(Modifier.weight(1f), verticalArrangement = Arrangement.spacedBy(2.dp)) {
                Text(row.studentName, style = MaterialTheme.typography.bodyLarge, color = AppColors.TextPrimary)
                val details = listOfNotNull(classLabel(row.className, row.sectionName), row.admissionNo).joinToString(" · ")
                if (details.isNotBlank()) Text(details, style = MaterialTheme.typography.bodySmall, color = AppColors.TextSecondary)
                row.oldestDueDays?.let {
                    Text(
                        pluralStringResource(R.plurals.fees_oldest_due_days, it, it),
                        style = MaterialTheme.typography.bodySmall,
                        color = if (it > OVERDUE_DAYS) AppColors.Error else AppColors.TextSecondary,
                    )
                }
                row.guardian?.let { guardian ->
                    Text(
                        listOfNotNull(guardian.name, guardian.phone).joinToString(" · "),
                        style = MaterialTheme.typography.bodySmall,
                        color = AppColors.TextSecondary,
                    )
                }
            }
            MoneyText(row.balanceMinor, currency = currency, style = MaterialTheme.typography.titleMedium, fontWeight = FontWeight.SemiBold)
        }
        row.aging?.let {
            HorizontalDivider(color = AppColors.Border)
            AgingColumns(it, currency)
        }
        onOpenLedger?.let {
            AppTextButton(stringResource(R.string.fees_ledger_view), it, leadingIcon = Icons.AutoMirrored.Outlined.ReceiptLong)
        }
    }
}

@Composable
private fun AgingColumns(aging: DuesAging, currency: String) {
    val buckets = listOf(
        stringResource(R.string.fees_aging_30) to aging.upTo30Minor,
        stringResource(R.string.fees_aging_60) to aging.upTo60Minor,
        stringResource(R.string.fees_aging_90) to aging.upTo90Minor,
        stringResource(R.string.fees_aging_over_90) to aging.over90Minor,
    )
    Row(Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.spacedBy(4.dp)) {
        buckets.forEachIndexed { index, (label, amount) ->
            Column(Modifier.weight(1f), horizontalAlignment = Alignment.End) {
                Text(label, style = MaterialTheme.typography.labelSmall, color = AppColors.TextSecondary, textAlign = TextAlign.End)
                MoneyText(
                    amountMinor = amount,
                    currency = currency,
                    style = MaterialTheme.typography.bodySmall,
                    color = when {
                        amount == 0L -> AppColors.TextSecondary
                        index == buckets.lastIndex -> AppColors.Error
                        else -> AppColors.TextPrimary
                    },
                )
            }
        }
    }
}

private const val OVERDUE_DAYS = 30
