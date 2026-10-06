package com.schoolapp.feature.dashboard.parent

import com.schoolapp.core.designsystem.component.StatusTone
import com.schoolapp.core.model.attendance.AttendanceStatus
import com.schoolapp.feature.dashboard.R

internal data class AttendanceChip(val labelRes: Int, val tone: StatusTone)

/** Unmarked (null) stays a neutral "Not marked yet"; it is never reported as absent. */
internal fun attendanceChip(status: AttendanceStatus?): AttendanceChip = when (status) {
    null -> AttendanceChip(R.string.dashboard_attendance_not_marked, StatusTone.Neutral)
    AttendanceStatus.PRESENT -> AttendanceChip(R.string.dashboard_attendance_present, StatusTone.Success)
    AttendanceStatus.ABSENT -> AttendanceChip(R.string.dashboard_attendance_absent, StatusTone.Error)
    AttendanceStatus.LATE -> AttendanceChip(R.string.dashboard_attendance_late, StatusTone.Warning)
    AttendanceStatus.LEAVE -> AttendanceChip(R.string.dashboard_attendance_leave, StatusTone.Info)
    AttendanceStatus.HALF_DAY -> AttendanceChip(R.string.dashboard_attendance_half_day, StatusTone.Warning)
}
