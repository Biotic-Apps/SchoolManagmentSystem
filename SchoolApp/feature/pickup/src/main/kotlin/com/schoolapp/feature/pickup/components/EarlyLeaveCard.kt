package com.schoolapp.feature.pickup.components

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.ExperimentalLayoutApi
import androidx.compose.foundation.layout.FlowRow
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.width
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.outlined.Check
import androidx.compose.material.icons.outlined.Close
import androidx.compose.material.icons.automirrored.outlined.DirectionsWalk
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.ui.Modifier
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import com.schoolapp.core.designsystem.component.AppCard
import com.schoolapp.core.designsystem.component.AppTextButton
import com.schoolapp.core.designsystem.component.PrimaryButton
import com.schoolapp.core.designsystem.component.StatusChip
import com.schoolapp.core.designsystem.theme.AppColors
import com.schoolapp.core.model.pickup.EarlyLeave
import com.schoolapp.core.model.pickup.EarlyLeaveStatus
import com.schoolapp.core.ui.formatDate
import com.schoolapp.core.ui.formatTime
import com.schoolapp.feature.pickup.R

/** Gate actions for one early leave; any null callback hides its button. */
internal class EarlyLeaveActions(
    val onApprove: (() -> Unit)? = null,
    val onReject: (() -> Unit)? = null,
    val onRecordDeparture: (() -> Unit)? = null,
)

/** [departedTime] is the 12-hour time the student left (gate view); [showStudent] off shows the date instead. */
@OptIn(ExperimentalLayoutApi::class)
@Composable
internal fun EarlyLeaveCard(
    leave: EarlyLeave,
    modifier: Modifier = Modifier,
    showStudent: Boolean = true,
    departedTime: String? = null,
    busy: Boolean = false,
    actions: EarlyLeaveActions = EarlyLeaveActions(),
) {
    AppCard(modifier.fillMaxWidth()) {
        Row(verticalAlignment = Alignment.Top) {
            Column(Modifier.weight(1f)) {
                val title = if (showStudent) leave.studentName.orEmpty() else formatDate(leave.date).orEmpty()
                Text(title, style = MaterialTheme.typography.titleMedium, fontWeight = FontWeight.SemiBold, color = AppColors.TextPrimary)
                if (showStudent) {
                    val classLine = listOfNotNull(leave.className, leave.sectionName).joinToString(" - ")
                    if (classLine.isNotBlank()) Text(classLine, style = MaterialTheme.typography.bodyMedium, color = AppColors.TextSecondary)
                }
            }
            Spacer(Modifier.width(8.dp))
            val status = if (departedTime != null) {
                stringResource(R.string.pickup_leave_departed_at, departedTime)
            } else {
                leaveStatusLabel(leave.status)
            }
            StatusChip(status, if (departedTime != null) EarlyLeaveStatus.DEPARTED.tone() else leave.status.tone())
        }
        Spacer(Modifier.height(8.dp))
        Detail(stringResource(R.string.pickup_leave_time, formatTime(leave.time).orEmpty()))
        Detail(stringResource(R.string.pickup_leave_reason, leave.reason))
        leave.pickupPersonName?.let { Detail(stringResource(R.string.pickup_leave_picker, it)) }
        leave.requestedByName?.let { Detail(stringResource(R.string.pickup_leave_requested_by, it)) }
        ActionRow(actions, busy)
    }
}

@OptIn(ExperimentalLayoutApi::class)
@Composable
private fun ActionRow(actions: EarlyLeaveActions, busy: Boolean) {
    if (actions.onApprove == null && actions.onReject == null && actions.onRecordDeparture == null) return
    Spacer(Modifier.height(12.dp))
    FlowRow(horizontalArrangement = Arrangement.spacedBy(8.dp), verticalArrangement = Arrangement.spacedBy(8.dp)) {
        actions.onRecordDeparture?.let {
            PrimaryButton(stringResource(R.string.pickup_record_departure), it, enabled = !busy, leadingIcon = Icons.AutoMirrored.Outlined.DirectionsWalk)
        }
        actions.onApprove?.let {
            AppTextButton(stringResource(R.string.pickup_approve), it, enabled = !busy, loading = busy, leadingIcon = Icons.Outlined.Check)
        }
        actions.onReject?.let {
            AppTextButton(
                stringResource(R.string.pickup_reject),
                it,
                enabled = !busy,
                leadingIcon = Icons.Outlined.Close,
                contentColor = AppColors.Error,
            )
        }
    }
}

@Composable
private fun Detail(text: String) {
    Text(text, style = MaterialTheme.typography.bodyMedium, color = AppColors.TextPrimary)
}
