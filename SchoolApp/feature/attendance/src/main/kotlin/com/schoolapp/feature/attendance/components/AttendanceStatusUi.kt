package com.schoolapp.feature.attendance.components

import androidx.compose.runtime.Composable
import androidx.compose.runtime.ReadOnlyComposable
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.res.stringResource
import com.schoolapp.core.designsystem.component.StatusTone
import com.schoolapp.core.designsystem.theme.AppColors
import com.schoolapp.core.model.attendance.AttendanceStatus
import com.schoolapp.core.model.attendance.RegisterStatus
import com.schoolapp.feature.attendance.R

@Composable
@ReadOnlyComposable
internal fun attendanceStatusLabel(status: AttendanceStatus?): String = stringResource(
    when (status) {
        AttendanceStatus.PRESENT -> R.string.attendance_status_present
        AttendanceStatus.ABSENT -> R.string.attendance_status_absent
        AttendanceStatus.LATE -> R.string.attendance_status_late
        AttendanceStatus.LEAVE -> R.string.attendance_status_leave
        AttendanceStatus.HALF_DAY -> R.string.attendance_status_half_day
        null -> R.string.attendance_status_unmarked
    },
)

/** One- or two-letter label for the compact segmented control. */
@Composable
@ReadOnlyComposable
internal fun attendanceStatusShort(status: AttendanceStatus): String = stringResource(
    when (status) {
        AttendanceStatus.PRESENT -> R.string.attendance_short_present
        AttendanceStatus.ABSENT -> R.string.attendance_short_absent
        AttendanceStatus.LATE -> R.string.attendance_short_late
        AttendanceStatus.LEAVE -> R.string.attendance_short_leave
        AttendanceStatus.HALF_DAY -> R.string.attendance_short_half_day
    },
)

internal fun AttendanceStatus?.tone(): StatusTone = when (this) {
    AttendanceStatus.PRESENT -> StatusTone.Success
    AttendanceStatus.ABSENT -> StatusTone.Error
    AttendanceStatus.LATE -> StatusTone.Warning
    AttendanceStatus.LEAVE, AttendanceStatus.HALF_DAY -> StatusTone.Info
    null -> StatusTone.Neutral
}

@Composable
@ReadOnlyComposable
internal fun registerStatusLabel(status: RegisterStatus): String = stringResource(
    when (status) {
        RegisterStatus.UNMARKED -> R.string.attendance_register_unmarked
        RegisterStatus.DRAFT -> R.string.attendance_register_draft
        RegisterStatus.SUBMITTED -> R.string.attendance_register_submitted
        RegisterStatus.LOCKED -> R.string.attendance_register_locked
        RegisterStatus.PENDING_REVIEW -> R.string.attendance_register_pending_review
    },
)

internal fun RegisterStatus.tone(): StatusTone = when (this) {
    RegisterStatus.UNMARKED -> StatusTone.Neutral
    RegisterStatus.DRAFT -> StatusTone.Info
    RegisterStatus.SUBMITTED -> StatusTone.Success
    RegisterStatus.LOCKED -> StatusTone.Neutral
    RegisterStatus.PENDING_REVIEW -> StatusTone.Warning
}

/** Foreground and container colours for a tone (light theme tokens). */
internal data class ToneColors(val content: Color, val container: Color)

internal fun StatusTone.toneColors(): ToneColors = when (this) {
    StatusTone.Success -> ToneColors(AppColors.Success, AppColors.SuccessContainer)
    StatusTone.Warning -> ToneColors(AppColors.Warning, AppColors.WarningContainer)
    StatusTone.Error -> ToneColors(AppColors.Error, AppColors.ErrorContainer)
    StatusTone.Info -> ToneColors(AppColors.Info, AppColors.InfoContainer)
    StatusTone.Neutral -> ToneColors(AppColors.TextSecondary, AppColors.Background)
}
