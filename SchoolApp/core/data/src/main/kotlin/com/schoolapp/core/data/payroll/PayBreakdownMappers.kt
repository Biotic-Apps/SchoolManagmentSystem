package com.schoolapp.core.data.payroll

import com.schoolapp.core.model.payroll.PayAttendance
import com.schoolapp.core.model.payroll.PayBreakdown
import com.schoolapp.core.model.payroll.PayOvertime
import com.schoolapp.core.model.payroll.PayslipLineItem
import com.schoolapp.core.network.dto.payroll.PayAttendanceDto
import com.schoolapp.core.network.dto.payroll.PayBreakdownDto
import com.schoolapp.core.network.dto.payroll.PayBreakdownItemDto
import com.schoolapp.core.network.dto.payroll.PayOvertimeDto

/** Totals fall back to the sum of the rows when the API leaves them out. */
internal fun PayBreakdownDto?.toModel(overtimeMinutes: Int, overtimeMinor: Long): PayBreakdown {
    val earnings = this?.earnings.orEmpty().map { it.toModel() }
    val deductions = this?.deductions.orEmpty().map { it.toModel() }
    val overtime = this?.overtime?.toModel()
    return PayBreakdown(
        earnings = earnings,
        deductionItems = deductions,
        totalEarningsMinor = this?.totalEarningsMinor ?: earnings.sumOf { it.amountMinor },
        totalDeductionsMinor = this?.totalDeductionsMinor ?: deductions.sumOf { it.amountMinor },
        overtimeMinutes = overtimeMinutes.takeIf { it > 0 } ?: overtime?.minutes ?: 0,
        overtimeMinor = overtimeMinor.takeIf { it != 0L } ?: overtime?.amountMinor ?: 0,
        attendance = this?.attendance?.toModel(),
        overtime = overtime,
    )
}

private fun PayBreakdownItemDto.toModel() = PayslipLineItem(label, note?.takeIf { it.isNotBlank() }, amountMinor)

private fun PayAttendanceDto.toModel() = PayAttendance(
    payDays = payDays,
    present = present,
    late = late,
    absent = absent,
    halfDays = halfDays,
    paidLeave = paidLeave,
    unpaidLeave = unpaidLeave,
)

private fun PayOvertimeDto.toModel() = PayOvertime(minutes, hourlyRateMinor, amountMinor, pendingMinutes)
