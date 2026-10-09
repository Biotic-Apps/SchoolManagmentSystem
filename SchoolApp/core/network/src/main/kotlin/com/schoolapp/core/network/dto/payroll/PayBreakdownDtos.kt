package com.schoolapp.core.network.dto.payroll

import kotlinx.serialization.Serializable

/** `staff` on GET /payslips/me — carries the designation (not top-level). */
@Serializable
data class PayslipStaffDto(
    val id: String = "",
    val name: String = "",
    val designation: String? = null,
    val employeeNo: String? = null,
)

/** `pdf` on a payslip: `{status, fileUrl, generatedAt}`. */
@Serializable
data class PayslipPdfDto(val status: String? = null, val fileUrl: String? = null, val generatedAt: String? = null)

/** One earnings / deductions row; `note` is plain English ("2 days × PKR 2,629.63 a day"). */
@Serializable
data class PayBreakdownItemDto(val label: String = "", val note: String? = null, val amountMinor: Long = 0)

@Serializable
data class PayBreakdownDto(
    val earnings: List<PayBreakdownItemDto> = emptyList(),
    val deductions: List<PayBreakdownItemDto> = emptyList(),
    val totalEarningsMinor: Long? = null,
    val totalDeductionsMinor: Long? = null,
    val attendance: PayAttendanceDto? = null,
    val overtime: PayOvertimeDto? = null,
)

@Serializable
data class PayAttendanceDto(
    val calendarDays: Int = 0,
    val payDays: Int = 0,
    val present: Int = 0,
    val late: Int = 0,
    val absent: Int = 0,
    val halfDays: Int = 0,
    val paidLeave: Int = 0,
    val unpaidLeave: Int = 0,
    val unmarked: Int = 0,
    val perDayBase: String? = null,
    val perDayMinor: Long = 0,
    val absenceHalfDays: Int = 0,
    val absenceDeductionMinor: Long = 0,
    val latesPerDeduction: Int = 0,
    val lateDeductionDays: Double = 0.0,
    val lateHalfDays: Int = 0,
    val lateDeductionMinor: Long = 0,
)

@Serializable
data class PayOvertimeDto(
    val minutes: Int = 0,
    val hourlyRateMinor: Long = 0,
    val multiplier: Double? = null,
    val dailyHours: Double = 0.0,
    val amountMinor: Long = 0,
    val entryIds: List<String> = emptyList(),
    val pendingMinutes: Int = 0,
)
