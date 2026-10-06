package com.schoolapp.feature.attendance.components

import androidx.compose.runtime.Composable
import androidx.compose.runtime.ReadOnlyComposable
import androidx.compose.ui.res.stringResource
import com.schoolapp.core.designsystem.component.StatusTone
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
