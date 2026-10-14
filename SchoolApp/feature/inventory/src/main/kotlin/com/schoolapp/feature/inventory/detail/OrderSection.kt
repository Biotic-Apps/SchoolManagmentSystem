package com.schoolapp.feature.inventory.detail

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.material3.HorizontalDivider
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.unit.dp
import com.schoolapp.core.designsystem.component.AppCard
import com.schoolapp.core.designsystem.component.InlineMessage
import com.schoolapp.core.designsystem.component.KeyValueRow
import com.schoolapp.core.designsystem.component.StatusChip
import com.schoolapp.core.designsystem.component.StatusTone
import com.schoolapp.core.designsystem.money.MoneyFormat
import com.schoolapp.core.designsystem.theme.AppColors
import com.schoolapp.core.model.inventory.PurchaseOrder
import com.schoolapp.core.ui.formatDate
import com.schoolapp.feature.inventory.R
import com.schoolapp.feature.inventory.components.TotalLine
import com.schoolapp.feature.inventory.components.label
import com.schoolapp.feature.inventory.components.tone

/** Purchase order: vendor, expected date, total, and per line ordered vs received. */
@Composable
internal fun OrderSection(order: PurchaseOrder, modifier: Modifier = Modifier) {
    AppCard(modifier, verticalSpacing = 8.dp) {
        Row(Modifier.fillMaxWidth(), verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(12.dp)) {
            Text(
                stringResource(R.string.inv_purchase_order, order.poNo),
                style = MaterialTheme.typography.titleSmall,
                color = AppColors.TextPrimary,
                modifier = Modifier.weight(1f),
            )
            StatusChip(stringResource(order.status.label()), order.status.tone())
        }
        val none = stringResource(R.string.inv_none)
        KeyValueRow(stringResource(R.string.inv_vendor), order.vendorName ?: none)
        KeyValueRow(stringResource(R.string.inv_expected_on), formatDate(order.expectedOn) ?: none)
        order.lines.forEach { line ->
            HorizontalDivider(color = AppColors.Border)
            LineSummary(
                name = line.itemName,
                detail = listOf(
                    stringResource(R.string.inv_ordered_received, line.orderedQty, line.receivedQty),
                    stringResource(R.string.inv_line_math, line.orderedQty, MoneyFormat.format(line.unitPriceMinor)),
                ).joinToString(" · "),
                totalMinor = line.totalMinor,
            )
        }
        HorizontalDivider(color = AppColors.Border)
        TotalLine(stringResource(R.string.inv_order_total), order.totalMinor, emphasis = true)
        if (order.billed) InlineMessage(stringResource(R.string.inv_billed_note), StatusTone.Info)
    }
}
