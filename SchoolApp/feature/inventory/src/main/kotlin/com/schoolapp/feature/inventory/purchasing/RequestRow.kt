package com.schoolapp.feature.inventory.purchasing

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import com.schoolapp.core.designsystem.component.AppCard
import com.schoolapp.core.designsystem.component.MoneyText
import com.schoolapp.core.designsystem.component.StatusChip
import com.schoolapp.core.designsystem.theme.AppColors
import com.schoolapp.core.model.inventory.PurchaseRequest
import com.schoolapp.core.ui.formatDate
import com.schoolapp.feature.inventory.R
import com.schoolapp.feature.inventory.components.label
import com.schoolapp.feature.inventory.components.tone

/** Request number and date, item count, estimated total, reason, status and its purchase order. */
@Composable
internal fun RequestRow(request: PurchaseRequest, onClick: () -> Unit, modifier: Modifier = Modifier) {
    AppCard(modifier, onClick = onClick, verticalSpacing = 6.dp) {
        Row(Modifier.fillMaxWidth(), verticalAlignment = Alignment.Top, horizontalArrangement = Arrangement.spacedBy(12.dp)) {
            Column(Modifier.weight(1f), verticalArrangement = Arrangement.spacedBy(2.dp)) {
                Text(
                    listOfNotNull(request.requestNo, formatDate(request.createdAt)).joinToString(" · "),
                    style = MaterialTheme.typography.titleSmall,
                    color = AppColors.TextPrimary,
                )
                val count = request.lines.size
                Text(
                    if (count == 1) stringResource(R.string.inv_request_one_item) else stringResource(R.string.inv_request_items, count),
                    style = MaterialTheme.typography.bodySmall,
                    color = AppColors.TextSecondary,
                )
            }
            MoneyText(request.estimatedTotalMinor, style = MaterialTheme.typography.titleSmall)
        }
        Text(request.reason, style = MaterialTheme.typography.bodyMedium, color = AppColors.TextPrimary, maxLines = 2, overflow = TextOverflow.Ellipsis)
        Row(horizontalArrangement = Arrangement.spacedBy(8.dp), verticalAlignment = Alignment.CenterVertically) {
            StatusChip(stringResource(request.status.label()), request.status.tone())
            request.order?.let { order ->
                Text(order.poNo, style = MaterialTheme.typography.bodySmall, color = AppColors.TextSecondary)
                StatusChip(stringResource(order.status.label()), order.status.tone())
            }
        }
    }
}
