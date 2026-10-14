package com.schoolapp.core.model.payroll.setup

/** One named allowance or deduction of a salary structure (minor units). */
data class SalaryItem(val name: String, val amountMinor: Long)

/** Current salary of a staff row: gross = basic + allowances. */
data class StaffSalary(
    val effectiveFrom: String,
    val basicMinor: Long,
    val allowancesMinor: Long,
    val deductionsMinor: Long,
    val grossMinor: Long,
    val overtimeRateMinor: Long?,
)

data class PayrollStaff(
    val staffId: String,
    val name: String,
    val designation: String?,
    val employeeNo: String?,
    val salary: StaffSalary?,
)

/** The branch principal's login; [staffId] null = not on payroll yet. */
data class BranchPrincipal(val name: String, val staffId: String?)

data class PayrollStaffList(val items: List<PayrollStaff>, val missingCount: Int, val principal: BranchPrincipal?)

data class SalaryStructure(
    val id: String?,
    val effectiveFrom: String,
    val basicMinor: Long,
    val allowances: List<SalaryItem>,
    val deductions: List<SalaryItem>,
    val overtimeRateMinor: Long?,
    val reason: String?,
) {
    val allowancesMinor: Long get() = allowances.sumOf { it.amountMinor }
    val deductionsMinor: Long get() = deductions.sumOf { it.amountMinor }
    val grossMinor: Long get() = basicMinor + allowancesMinor
    val netMinor: Long get() = grossMinor - deductionsMinor
}

data class SalaryStructures(val current: SalaryStructure?, val history: List<SalaryStructure>)

data class SalaryStructureInput(
    val effectiveFrom: String,
    val basicMinor: Long,
    val allowances: List<SalaryItem>,
    val deductions: List<SalaryItem>,
    val overtimeRateMinor: Long?,
    val reason: String?,
)

enum class WorkingDaysMode { CALENDAR, FIXED }

enum class PerDayBase { GROSS, BASIC }

/** School-wide pay rules (absences, lates, overtime). */
data class PayRules(
    val workingDaysMode: WorkingDaysMode,
    val fixedWorkingDays: Int,
    val perDayBase: PerDayBase,
    val latesPerDeduction: Int,
    val lateDeductionDays: Double,
    val overtimeEnabled: Boolean,
    val overtimeMultiplier: Double,
    val overtimeGraceMinutes: Int,
    val dailyHours: Double?,
)

/** [rules] plus what the form shows around them: saved yet, and the branch staff timings. */
data class PayRulesView(
    val rules: PayRules,
    val saved: Boolean,
    val staffArrivesAt: String?,
    val staffLeavesAt: String?,
    val branchDailyHours: Double?,
)
