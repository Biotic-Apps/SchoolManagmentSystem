package com.schoolapp.core.data.payroll

import com.schoolapp.core.data.fees.DEFAULT_CURRENCY
import com.schoolapp.core.model.common.enumOrDefault
import com.schoolapp.core.model.payroll.PayItem
import com.schoolapp.core.model.payroll.PayrollLine
import com.schoolapp.core.model.payroll.PayrollRun
import com.schoolapp.core.model.payroll.PayrollRunStatus
import com.schoolapp.core.model.payroll.Payslip
import com.schoolapp.core.network.dto.payroll.PayrollLineDto
import com.schoolapp.core.network.dto.payroll.PayrollRunDto
import com.schoolapp.core.network.dto.payroll.PayslipDto

internal fun PayslipDto.toModel(): Payslip {
    val allowanceItems = allowances.map { PayItem(it.name, it.amountMinor) }
    val deductionItems = deductions.map { PayItem(it.name, it.amountMinor) }
    return Payslip(
        month = month,
        staffName = staff?.name?.takeIf { it.isNotBlank() } ?: name.orEmpty(),
        designation = staff?.designation ?: designation,
        basicMinor = basicMinor,
        allowances = allowanceItems,
        deductions = deductionItems,
        allowancesMinor = allowancesMinor ?: allowanceItems.sumOf { it.amountMinor },
        deductionsMinor = deductionsMinor ?: deductionItems.sumOf { it.amountMinor },
        unpaidLeaveDays = unpaidLeaveDays,
        leaveDeductionMinor = leaveDeductionMinor,
        adjustmentsMinor = adjustmentsMinor,
        netMinor = netMinor,
        paidMinor = paidMinor,
        balanceMinor = balanceMinor,
        status = status,
        pdfUrl = pdf?.fileUrl ?: pdfUrl ?: fileUrl,
        currency = currency ?: DEFAULT_CURRENCY,
        breakdown = breakdown.toModel(overtimeMinutes, overtimeMinor),
    )
}

private fun PayrollLineDto.toModel() = PayrollLine(
    staffId = staffId,
    name = name,
    designation = designation,
    basicMinor = basicMinor,
    allowancesMinor = allowancesMinor,
    deductionsMinor = deductionsMinor,
    unpaidLeaveDays = unpaidLeaveDays,
    leaveDeductionMinor = leaveDeductionMinor,
    adjustmentsMinor = adjustmentsMinor,
    netMinor = netMinor,
    paidMinor = paidMinor,
    balanceMinor = balanceMinor,
    status = status,
    breakdown = breakdown.toModel(overtimeMinutes, overtimeMinor),
)

/** Totals fall back to the sum of the lines when the list endpoint leaves them out. */
internal fun PayrollRunDto.toModel(): PayrollRun {
    val lineModels = lines.orEmpty().map { it.toModel() }.sortedBy { it.name }
    return PayrollRun(
        id = id,
        branchName = branch?.name,
        month = month,
        status = enumOrDefault(status, PayrollRunStatus.DRAFT),
        staffCount = staffCount ?: lineModels.size,
        netMinor = totals?.netMinor ?: netMinor ?: lineModels.sumOf { it.netMinor },
        paidMinor = totals?.paidMinor ?: paidMinor ?: lineModels.sumOf { it.paidMinor },
        balanceMinor = totals?.balanceMinor ?: balanceMinor ?: lineModels.sumOf { it.balanceMinor },
        approvalId = approval?.takeIf { it.status == null || it.status == APPROVAL_PENDING }?.id ?: approvalId,
        lines = lineModels,
    )
}

private const val APPROVAL_PENDING = "PENDING"
