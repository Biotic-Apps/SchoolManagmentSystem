package com.schoolapp.core.model.payroll

data class PayItem(val name: String, val amountMinor: Long)

/** One month's salary slip; amounts in minor units. */
data class Payslip(
    val month: String,
    val staffName: String,
    val designation: String?,
    val basicMinor: Long,
    val allowances: List<PayItem>,
    val deductions: List<PayItem>,
    val allowancesMinor: Long,
    val deductionsMinor: Long,
    val unpaidLeaveDays: Double,
    val leaveDeductionMinor: Long,
    val adjustmentsMinor: Long,
    val netMinor: Long,
    val paidMinor: Long,
    val balanceMinor: Long,
    val status: String?,
    val pdfUrl: String?,
    val currency: String,
    val breakdown: PayBreakdown = PayBreakdown(),
) {
    val earnings: List<PayslipLineItem> get() = breakdown.earnings
    val deductionItems: List<PayslipLineItem> get() = breakdown.deductionItems
    val totalEarningsMinor: Long get() = breakdown.totalEarningsMinor
    val totalDeductionsMinor: Long get() = breakdown.totalDeductionsMinor
    val overtimeMinutes: Int get() = breakdown.overtimeMinutes
    val overtimeMinor: Long get() = breakdown.overtimeMinor
    val attendance: PayAttendance? get() = breakdown.attendance
    val overtime: PayOvertime? get() = breakdown.overtime
}
