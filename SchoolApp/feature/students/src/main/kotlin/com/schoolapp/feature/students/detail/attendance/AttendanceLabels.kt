package com.schoolapp.feature.students.detail.attendance

import androidx.compose.runtime.Composable
import androidx.compose.runtime.ReadOnlyComposable
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.res.stringResource
import com.schoolapp.core.designsystem.theme.AppColors
import com.schoolapp.core.model.attendance.AttendanceStatus
import com.schoolapp.feature.students.R

@Composable
@ReadOnlyComposable
internal fun attendanceLabel(status: AttendanceStatus?): String = stringResource(
    when (status) {
        AttendanceStatus.PRESENT -> R.string.sd_att_present
        AttendanceStatus.ABSENT -> R.string.sd_att_absent
        AttendanceStatus.LATE -> R.string.sd_att_late
        AttendanceStatus.LEAVE -> R.string.sd_att_leave
        AttendanceStatus.HALF_DAY -> R.string.sd_att_half_day
        null -> R.string.sd_att_unmarked
    },
)

/** Foreground and container colours of a day mark (theme tokens only). */
internal data class MarkColors(val content: Color, val container: Color)

internal fun AttendanceStatus?.markColors(): MarkColors = when (this) {
    AttendanceStatus.PRESENT -> MarkColors(AppColors.Success, AppColors.SuccessContainer)
    AttendanceStatus.ABSENT -> MarkColors(AppColors.Error, AppColors.ErrorContainer)
    AttendanceStatus.LATE -> MarkColors(AppColors.Warning, AppColors.WarningContainer)
    AttendanceStatus.LEAVE, AttendanceStatus.HALF_DAY -> MarkColors(AppColors.Info, AppColors.InfoContainer)
    null -> MarkColors(AppColors.TextSecondary, AppColors.Background)
}
