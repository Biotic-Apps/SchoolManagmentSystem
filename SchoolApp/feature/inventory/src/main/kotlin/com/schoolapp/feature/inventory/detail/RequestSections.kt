package com.schoolapp.feature.inventory.detail

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
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
import com.schoolapp.core.designsystem.component.KeyValueRow
import com.schoolapp.core.designsystem.component.MoneyText
import com.schoolapp.core.designsystem.component.StatusChip
import com.schoolapp.core.designsystem.money.MoneyFormat
import com.schoolapp.core.designsystem.theme.AppColors
import com.schoolapp.core.model.inventory.PurchaseRequest
import com.schoolapp.core.ui.formatDate
import com.schoolapp.feature.inventory.R
import com.schoolapp.feature.inventory.components.TotalLine
import com.schoolapp.feature.inventory.components.label
import com.schoolapp.feature.inventory.components.tone

/** Header: number, status, estimated total, who asked and why. */
@Composable
internal fun RequestSummaryCard(request: PurchaseRequest, modifier: Modifier = Modifier) {
    val none = stringResource(R.string.inv_none)
    AppCard(modifier, verticalSpacing = 4.dp) {
        Row(Modifier.fillMaxWidth(), verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(12.dp)) {
            Text(
                request.requestNo ?: stringResource(R.string.inv_purchase_request),
                style = MaterialTheme.typography.titleMedium,
                color = AppColors.TextPrimary,
                modifier = Modifier.weight(1f),
            )
            StatusChip(stringResource(request.status.label()), request.status.tone())
        }
        TotalLine(stringResource(R.string.inv_estimated_total), request.estimatedTotalMinor, emphasis = true)
        KeyValueRow(stringResource(R.string.inv_requested_on), formatDate(request.createdAt) ?: none)
        KeyValueRow(stringResource(R.string.inv_requested_by), request.requestedBy ?: none)
        KeyValueRow(stringResource(R.string.inv_reason), request.reason)
    }
}

/** Requested items: quantity × estimated unit price = line total. */
@Composable
internal fun RequestLinesCard(request: PurchaseRequest, modifier: Modifier = Modifier) {
    AppCard(modifier, verticalSpacing = 8.dp) {
        Text(stringResource(R.string.inv_requested_items), style = MaterialTheme.typography.titleSmall, color = AppColors.TextPrimary)
        request.lines.forEachIndexed { index, line ->
            if (index > 0) HorizontalDivider(color = AppColors.Border)
            LineSummary(
                name = line.itemName,
                detail = stringResource(R.string.inv_line_math, line.quantity, MoneyFormat.format(line.estimatedUnitMinor)),
                totalMinor = line.totalMinor,
            )
        }
    }
}

@Composable
internal fun LineSummary(name: String, detail: String, totalMinor: Long, modifier: Modifier = Modifier) {
    Row(modifier.fillMaxWidth(), verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(12.dp)) {
        Column(Modifier.weight(1f)) {
            Text(name, style = MaterialTheme.typography.bodyLarge, color = AppColors.TextPrimary)
            Text(detail, style = MaterialTheme.typography.bodySmall, color = AppColors.TextSecondary)
        }
        MoneyText(totalMinor, style = MaterialTheme.typography.bodyLarge)
    }
}
