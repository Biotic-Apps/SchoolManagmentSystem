package com.schoolapp.feature.payroll.salary

import androidx.compose.foundation.border
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.ExperimentalLayoutApi
import androidx.compose.foundation.layout.FlowRow
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.widthIn
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.unit.dp
import com.schoolapp.core.designsystem.theme.AppColors
import com.schoolapp.core.model.payroll.PayAttendance
import com.schoolapp.feature.payroll.R
import com.schoolapp.feature.payroll.components.formatHours

/** Compact day counts for the month (and overtime hours when there are any). */
@OptIn(ExperimentalLayoutApi::class)
@Composable
internal fun PayAttendanceStrip(attendance: PayAttendance, overtimeMinutes: Int, modifier: Modifier = Modifier) {
    Column(modifier.fillMaxWidth(), verticalArrangement = Arrangement.spacedBy(8.dp)) {
        Text(stringResource(R.string.payroll_attendance_title), style = MaterialTheme.typography.labelLarge, color = AppColors.TextPrimary)
        FlowRow(horizontalArrangement = Arrangement.spacedBy(8.dp), verticalArrangement = Arrangement.spacedBy(8.dp)) {
            CountTile(stringResource(R.string.payroll_working_days), attendance.payDays.toString())
            CountTile(stringResource(R.string.payroll_present), attendance.present.toString())
            CountTile(stringResource(R.string.payroll_late), attendance.late.toString(), warn = attendance.late > 0)
            CountTile(stringResource(R.string.payroll_absent), attendance.absent.toString(), warn = attendance.absent > 0)
            CountTile(stringResource(R.string.payroll_paid_leave), attendance.paidLeave.toString())
            CountTile(stringResource(R.string.payroll_unpaid_leave), attendance.unpaidLeave.toString(), warn = attendance.unpaidLeave > 0)
            if (overtimeMinutes > 0) CountTile(stringResource(R.string.payroll_overtime), formatHours(overtimeMinutes))
        }
    }
}

@Composable
private fun CountTile(label: String, value: String, warn: Boolean = false) {
    Column(
        Modifier
            .widthIn(min = 76.dp)
            .border(1.dp, AppColors.Border, RoundedCornerShape(10.dp))
            .padding(horizontal = 10.dp, vertical = 6.dp),
    ) {
        Text(value, style = MaterialTheme.typography.titleMedium, color = if (warn) AppColors.Error else AppColors.TextPrimary)
        Text(label, style = MaterialTheme.typography.bodySmall, color = AppColors.TextSecondary)
    }
}
