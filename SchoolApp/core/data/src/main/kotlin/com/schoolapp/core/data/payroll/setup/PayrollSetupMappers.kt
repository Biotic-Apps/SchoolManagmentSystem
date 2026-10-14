package com.schoolapp.core.data.payroll.setup

import com.schoolapp.core.model.payroll.setup.BranchPrincipal
import com.schoolapp.core.model.payroll.setup.PayRules
import com.schoolapp.core.model.payroll.setup.PayRulesView
import com.schoolapp.core.model.payroll.setup.PayrollStaff
import com.schoolapp.core.model.payroll.setup.PayrollStaffList
import com.schoolapp.core.model.payroll.setup.PerDayBase
import com.schoolapp.core.model.payroll.setup.SalaryItem
import com.schoolapp.core.model.payroll.setup.SalaryStructure
import com.schoolapp.core.model.payroll.setup.SalaryStructureInput
import com.schoolapp.core.model.payroll.setup.SalaryStructures
import com.schoolapp.core.model.payroll.setup.StaffSalary
import com.schoolapp.core.model.payroll.setup.WorkingDaysMode
import com.schoolapp.core.network.dto.payroll.setup.PayComponentDto
import com.schoolapp.core.network.dto.payroll.setup.PayrollSettingsBodyDto
import com.schoolapp.core.network.dto.payroll.setup.PayrollSettingsDto
import com.schoolapp.core.network.dto.payroll.setup.PayrollStaffListDto
import com.schoolapp.core.network.dto.payroll.setup.SalaryStructureBodyDto
import com.schoolapp.core.network.dto.payroll.setup.SalaryStructureDto
import com.schoolapp.core.network.dto.payroll.setup.SalaryStructuresDto

internal fun PayrollStaffListDto.toModel() = PayrollStaffList(
    items = items.map { row ->
        PayrollStaff(
            staffId = row.staffId,
            name = row.name,
            designation = row.designation,
            employeeNo = row.employeeNo,
            salary = row.salary?.let {
                StaffSalary(it.effectiveFrom, it.basicMinor, it.allowancesMinor, it.deductionsMinor, it.grossMinor, it.overtimeRateMinor)
            },
        )
    },
    missingCount = missingCount,
    principal = principal?.let { BranchPrincipal(it.name.orEmpty(), it.staffId) },
)

internal fun SalaryStructuresDto.toModel(): SalaryStructures {
    val now = current?.toModel()
    val earlier = history.map { it.toModel() }.filterNot { now != null && it.id == now.id && it.effectiveFrom == now.effectiveFrom }
    return SalaryStructures(now, earlier)
}

private fun SalaryStructureDto.toModel() = SalaryStructure(
    id = id,
    effectiveFrom = effectiveFrom,
    basicMinor = basicMinor,
    allowances = allowances.map { SalaryItem(it.name, it.amountMinor) },
    deductions = deductions.map { SalaryItem(it.name, it.amountMinor) },
    overtimeRateMinor = overtimeRateMinor,
    reason = reason,
)

internal fun SalaryStructureInput.toBody() = SalaryStructureBodyDto(
    effectiveFrom = effectiveFrom,
    basicMinor = basicMinor,
    allowances = allowances.map { PayComponentDto(it.name.trim(), it.amountMinor) },
    deductions = deductions.map { PayComponentDto(it.name.trim(), it.amountMinor) },
    overtimeRateMinor = overtimeRateMinor,
    reason = reason?.trim()?.takeIf { it.isNotEmpty() },
)

internal fun PayrollSettingsDto.toModel() = PayRulesView(
    rules = PayRules(
        workingDaysMode = if (workingDaysMode.equals("FIXED", true)) WorkingDaysMode.FIXED else WorkingDaysMode.CALENDAR,
        fixedWorkingDays = fixedWorkingDays,
        perDayBase = if (perDayBase.equals("BASIC", true)) PerDayBase.BASIC else PerDayBase.GROSS,
        latesPerDeduction = latesPerDeduction,
        lateDeductionDays = lateDeductionDays,
        overtimeEnabled = overtimeEnabled,
        overtimeMultiplier = overtimeMultiplier,
        overtimeGraceMinutes = overtimeGraceMinutes,
        dailyHours = dailyHours,
    ),
    saved = saved,
    staffArrivesAt = staffArrivesAt,
    staffLeavesAt = staffLeavesAt,
    branchDailyHours = branchDailyHours,
)

internal fun PayRules.toBody() = PayrollSettingsBodyDto(
    workingDaysMode = workingDaysMode.name,
    fixedWorkingDays = fixedWorkingDays,
    perDayBase = perDayBase.name,
    latesPerDeduction = latesPerDeduction,
    lateDeductionDays = lateDeductionDays,
    overtimeEnabled = overtimeEnabled,
    overtimeMultiplier = overtimeMultiplier,
    overtimeGraceMinutes = overtimeGraceMinutes,
    dailyHours = dailyHours,
)
