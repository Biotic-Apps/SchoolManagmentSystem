package com.schoolapp.feature.approvals.components

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.material3.MaterialTheme
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import com.schoolapp.core.designsystem.component.ListItemRow
import com.schoolapp.core.designsystem.component.MoneyText
import com.schoolapp.core.designsystem.component.StatusChip
import com.schoolapp.core.model.approval.ApprovalRequest
import com.schoolapp.core.ui.formatTimestamp
import com.schoolapp.core.ui.humanizeKey

@Composable
internal fun ApprovalRow(item: ApprovalRequest, onClick: () -> Unit, modifier: Modifier = Modifier) {
    ListItemRow(
        title = item.title,
        supporting = listOfNotNull(humanizeKey(item.type), item.requestedByName, formatTimestamp(item.createdAt))
            .joinToString(" · "),
        onClick = onClick,
        modifier = modifier,
        trailing = {
            Column(horizontalAlignment = Alignment.End, verticalArrangement = Arrangement.spacedBy(4.dp)) {
                item.amountMinor?.let { MoneyText(it, style = MaterialTheme.typography.titleSmall) }
                StatusChip(statusLabel(item.status), item.status.tone())
            }
        },
    )
}
