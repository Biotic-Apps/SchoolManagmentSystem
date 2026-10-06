package com.schoolapp.feature.approvals.detail.components

import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.res.stringResource
import com.schoolapp.core.designsystem.component.AppCard
import com.schoolapp.core.designsystem.component.KeyValueRow
import com.schoolapp.core.designsystem.component.MoneyRow
import com.schoolapp.core.designsystem.component.SectionHeader
import com.schoolapp.core.designsystem.component.StatusChip
import com.schoolapp.core.model.approval.ApprovalDecision
import com.schoolapp.core.model.approval.ApprovalRequest
import com.schoolapp.core.ui.formatTimestamp
import com.schoolapp.core.ui.humanizeKey
import com.schoolapp.feature.approvals.R
import com.schoolapp.feature.approvals.components.statusLabel
import com.schoolapp.feature.approvals.components.tone

@Composable
internal fun ApprovalSummaryCard(request: ApprovalRequest, modifier: Modifier = Modifier) {
    AppCard(modifier.fillMaxWidth()) {
        SectionHeader(
            title = request.title,
            action = { StatusChip(statusLabel(request.status), request.status.tone()) },
        )
        KeyValueRow(stringResource(R.string.approvals_type), humanizeKey(request.type))
        request.entityType?.let { KeyValueRow(stringResource(R.string.approvals_record), humanizeKey(it)) }
        KeyValueRow(stringResource(R.string.approvals_requested_by), request.requestedByName)
        KeyValueRow(stringResource(R.string.approvals_requested_at), formatTimestamp(request.createdAt))
        request.currentStep?.let { KeyValueRow(stringResource(R.string.approvals_current_step), it.toString()) }
        request.amountMinor?.let { MoneyRow(stringResource(R.string.approvals_amount), it, emphasized = true) }
    }
}

internal fun decidedMessageRes(decision: ApprovalDecision): Int = when (decision) {
    ApprovalDecision.APPROVED -> R.string.approvals_decided_approved
    ApprovalDecision.REJECTED -> R.string.approvals_decided_rejected
    ApprovalDecision.RETURNED -> R.string.approvals_decided_returned
}
