package com.schoolapp.core.model.payroll

/** One earnings or deductions row; `note` explains the amount in plain words. */
data class PayslipLineItem(val label: String, val note: String?, val amountMinor: Long)

/** Day counts behind the month's pay. */
data class PayAttendance(
    val payDays: Int,
    val present: Int,
    val late: Int,
    val absent: Int,
    val halfDays: Int,
    val paidLeave: Int,
    val unpaidLeave: Int,
)

data class PayOvertime(val minutes: Int, val hourlyRateMinor: Long, val amountMinor: Long, val pendingMinutes: Int)

/** Itemised pay for a payslip or a run line; empty lists mean an older run without a breakdown. */
data class PayBreakdown(
    val earnings: List<PayslipLineItem> = emptyList(),
    val deductionItems: List<PayslipLineItem> = emptyList(),
    val totalEarningsMinor: Long = 0,
    val totalDeductionsMinor: Long = 0,
    val overtimeMinutes: Int = 0,
    val overtimeMinor: Long = 0,
    val attendance: PayAttendance? = null,
    val overtime: PayOvertime? = null,
) {
    val hasItems: Boolean get() = earnings.isNotEmpty() || deductionItems.isNotEmpty()
}
