package com.schoolapp.feature.approvals.detail.components

import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.material3.HorizontalDivider
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.unit.dp
import com.schoolapp.core.designsystem.component.AppCard
import com.schoolapp.core.designsystem.component.ListItemRow
import com.schoolapp.core.designsystem.component.SectionHeader
import com.schoolapp.core.designsystem.component.StatusChip
import com.schoolapp.core.designsystem.theme.AppColors
import com.schoolapp.core.model.approval.ApprovalStatus
import com.schoolapp.core.model.approval.ApprovalStep
import com.schoolapp.core.ui.formatTimestamp
import com.schoolapp.core.ui.humanizeKey
import com.schoolapp.feature.approvals.R
import com.schoolapp.feature.approvals.components.statusLabel
import com.schoolapp.feature.approvals.components.tone

@Composable
internal fun ApprovalStepsCard(steps: List<ApprovalStep>, modifier: Modifier = Modifier) {
    AppCard(modifier.fillMaxWidth(), contentPadding = 0.dp) {
        SectionHeader(title = stringResource(R.string.approvals_steps), modifier = Modifier.padding(horizontal = 16.dp))
        steps.forEachIndexed { index, step ->
            if (index > 0) HorizontalDivider(color = AppColors.Border)
            val status = step.decision?.let(ApprovalStatus::fromKey) ?: ApprovalStatus.PENDING
            val supporting = listOfNotNull(step.decidedByName, formatTimestamp(step.decidedAt), step.comment)
            ListItemRow(
                title = stringResource(R.string.approvals_step, step.order, step.approverRole?.let(::humanizeKey) ?: "-"),
                supporting = supporting.takeIf { it.isNotEmpty() }?.joinToString(" · "),
                trailing = { StatusChip(statusLabel(status), status.tone()) },
            )
        }
    }
}
