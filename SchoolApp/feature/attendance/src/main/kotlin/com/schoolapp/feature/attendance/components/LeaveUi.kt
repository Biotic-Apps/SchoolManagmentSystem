package com.schoolapp.feature.attendance.components

import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.outlined.BeachAccess
import androidx.compose.material.icons.outlined.Block
import androidx.compose.material.icons.outlined.Cancel
import androidx.compose.material.icons.outlined.CheckCircle
import androidx.compose.material.icons.outlined.EventBusy
import androidx.compose.material.icons.outlined.HourglassTop
import androidx.compose.material.icons.outlined.LocalHospital
import androidx.compose.material.icons.outlined.MoneyOff
import androidx.compose.material.icons.outlined.MoreHoriz
import androidx.compose.material.icons.outlined.WorkOutline
import androidx.compose.runtime.Composable
import androidx.compose.runtime.ReadOnlyComposable
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.res.stringResource
import com.schoolapp.core.designsystem.component.StatusTone
import com.schoolapp.core.model.leave.LeaveKind
import com.schoolapp.core.model.leave.LeaveRequest
import com.schoolapp.core.model.leave.LeaveStatus
import com.schoolapp.core.model.leave.LeaveType
import com.schoolapp.feature.attendance.R

@Composable
@ReadOnlyComposable
internal fun leaveStatusLabel(status: LeaveStatus): String = stringResource(
    when (status) {
        LeaveStatus.SUBMITTED -> R.string.attendance_leave_status_submitted
        LeaveStatus.APPROVED -> R.string.attendance_leave_status_approved
        LeaveStatus.REJECTED -> R.string.attendance_leave_status_rejected
        LeaveStatus.CANCELLED -> R.string.attendance_leave_status_cancelled
    },
)

internal fun LeaveStatus.tone(): StatusTone = when (this) {
    LeaveStatus.SUBMITTED -> StatusTone.Warning
    LeaveStatus.APPROVED -> StatusTone.Success
    LeaveStatus.REJECTED -> StatusTone.Error
    LeaveStatus.CANCELLED -> StatusTone.Neutral
}

internal fun LeaveStatus.icon(): ImageVector = when (this) {
    LeaveStatus.SUBMITTED -> Icons.Outlined.HourglassTop
    LeaveStatus.APPROVED -> Icons.Outlined.CheckCircle
    LeaveStatus.REJECTED -> Icons.Outlined.Cancel
    LeaveStatus.CANCELLED -> Icons.Outlined.Block
}

@Composable
@ReadOnlyComposable
internal fun leaveTypeLabel(type: LeaveType): String = stringResource(
    when (type) {
        LeaveType.CASUAL -> R.string.attendance_leave_type_casual
        LeaveType.SICK -> R.string.attendance_leave_type_sick
        LeaveType.ANNUAL -> R.string.attendance_leave_type_annual
        LeaveType.UNPAID -> R.string.attendance_leave_type_unpaid
        LeaveType.OTHER -> R.string.attendance_leave_type_other
    },
)

@Composable
@ReadOnlyComposable
internal fun leaveTypeHint(type: LeaveType): String = stringResource(
    when (type) {
        LeaveType.CASUAL -> R.string.leave_type_casual_hint
        LeaveType.SICK -> R.string.leave_type_sick_hint
        LeaveType.ANNUAL -> R.string.leave_type_annual_hint
        LeaveType.UNPAID -> R.string.leave_type_unpaid_hint
        LeaveType.OTHER -> R.string.leave_type_other_hint
    },
)

internal fun LeaveType.icon(): ImageVector = when (this) {
    LeaveType.CASUAL -> Icons.Outlined.WorkOutline
    LeaveType.SICK -> Icons.Outlined.LocalHospital
    LeaveType.ANNUAL -> Icons.Outlined.BeachAccess
    LeaveType.UNPAID -> Icons.Outlined.MoneyOff
    LeaveType.OTHER -> Icons.Outlined.MoreHoriz
}

/** Staff leave carries a meaningful type; student leave is always stored as OTHER, so it gets a neutral icon. */
internal fun LeaveRequest.displayIcon(): ImageVector =
    if (kind == LeaveKind.STAFF) (type ?: LeaveType.OTHER).icon() else Icons.Outlined.EventBusy
