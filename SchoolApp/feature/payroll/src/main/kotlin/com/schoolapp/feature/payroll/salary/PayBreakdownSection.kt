package com.schoolapp.feature.payroll.salary

import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import com.schoolapp.core.designsystem.component.MoneyRow
import com.schoolapp.core.designsystem.theme.AppColors
import com.schoolapp.core.model.payroll.PayslipLineItem

/** A titled list of earnings or deductions (notes as a muted second line) with a bold total. */
@Composable
internal fun PayBreakdownSection(
    title: String,
    items: List<PayslipLineItem>,
    totalLabel: String,
    totalMinor: Long,
    currency: String,
    negative: Boolean,
) {
    if (items.isEmpty()) return
    val sign = if (negative) -1 else 1
    val color = if (negative) AppColors.Error else AppColors.TextPrimary
    Text(title, style = MaterialTheme.typography.labelLarge, color = AppColors.TextPrimary)
    items.forEach { MoneyRow(it.label, sign * it.amountMinor, currency = currency, supporting = it.note, amountColor = color) }
    MoneyRow(totalLabel, sign * totalMinor, currency = currency, emphasized = true, amountColor = color)
}
