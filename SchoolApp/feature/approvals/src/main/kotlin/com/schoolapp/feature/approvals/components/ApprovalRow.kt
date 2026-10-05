package com.schoolapp.feature.approvals.components

import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import com.schoolapp.core.designsystem.component.ListItemRow
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
        trailing = { StatusChip(statusLabel(item.status), item.status.tone()) },
    )
}
