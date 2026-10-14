package com.schoolapp.core.network.dto.payroll.setup

import kotlinx.serialization.Serializable

@Serializable
data class StaffSalarySummaryDto(
    val effectiveFrom: String = "",
    val basicMinor: Long = 0,
    val allowancesMinor: Long = 0,
    val deductionsMinor: Long = 0,
    val grossMinor: Long = 0,
    val overtimeRateMinor: Long? = null,
)

@Serializable
data class PayrollStaffRowDto(
    val staffId: String = "",
    val name: String = "",
    val designation: String? = null,
    val employeeNo: String? = null,
    val status: String? = null,
    val salary: StaffSalarySummaryDto? = null,
)

@Serializable
data class BranchPrincipalDto(val userId: String? = null, val name: String? = null, val staffId: String? = null)

/** `GET /payroll/staff`: active staff of every type with their current salary. */
@Serializable
data class PayrollStaffListDto(
    val items: List<PayrollStaffRowDto> = emptyList(),
    val missingCount: Int = 0,
    val principal: BranchPrincipalDto? = null,
)

@Serializable
data class BranchIdBodyDto(val branchId: String)

@Serializable
data class PayComponentDto(val name: String = "", val amountMinor: Long = 0)

@Serializable
data class SalaryStructureDto(
    val id: String? = null,
    val effectiveFrom: String = "",
    val basicMinor: Long = 0,
    val allowances: List<PayComponentDto> = emptyList(),
    val deductions: List<PayComponentDto> = emptyList(),
    val overtimeRateMinor: Long? = null,
    val reason: String? = null,
    val createdAt: String? = null,
)

/** `GET/PUT /staff/:id/salary-structure`: `{ current, history }` (history newest first). */
@Serializable
data class SalaryStructuresDto(val current: SalaryStructureDto? = null, val history: List<SalaryStructureDto> = emptyList())

@Serializable
data class SalaryStructureBodyDto(
    val effectiveFrom: String,
    val basicMinor: Long,
    val allowances: List<PayComponentDto>,
    val deductions: List<PayComponentDto>,
    val overtimeRateMinor: Long? = null,
    val reason: String? = null,
)

@Serializable
data class PayrollSettingsDto(
    val workingDaysMode: String = "CALENDAR",
    val fixedWorkingDays: Int = 26,
    val perDayBase: String = "GROSS",
    val latesPerDeduction: Int = 3,
    val lateDeductionDays: Double = 1.0,
    val overtimeEnabled: Boolean = false,
    val overtimeMultiplier: Double = 1.5,
    val overtimeGraceMinutes: Int = 15,
    val dailyHours: Double? = null,
    val branchDailyHours: Double? = null,
    val staffArrivesAt: String? = null,
    val staffLeavesAt: String? = null,
    val saved: Boolean = false,
)

@Serializable
data class PayrollSettingsBodyDto(
    val workingDaysMode: String,
    val fixedWorkingDays: Int,
    val perDayBase: String,
    val latesPerDeduction: Int,
    val lateDeductionDays: Double,
    val overtimeEnabled: Boolean,
    val overtimeMultiplier: Double,
    val overtimeGraceMinutes: Int,
    val dailyHours: Double? = null,
)
