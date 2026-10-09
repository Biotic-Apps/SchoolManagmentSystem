package com.schoolapp.core.model.payroll

enum class PayrollRunStatus { DRAFT, CALCULATED, REVIEWED, APPROVED, PARTIALLY_PAID, PAID, CLOSED }

data class PayrollLine(
    val staffId: String,
    val name: String,
    val designation: String?,
    val basicMinor: Long,
    val allowancesMinor: Long,
    val deductionsMinor: Long,
    val unpaidLeaveDays: Double,
    val leaveDeductionMinor: Long,
    val adjustmentsMinor: Long,
    val netMinor: Long,
    val paidMinor: Long,
    val balanceMinor: Long,
    val status: String?,
    val breakdown: PayBreakdown = PayBreakdown(),
)

data class PayrollRun(
    val id: String,
    val branchName: String?,
    val month: String,
    val status: PayrollRunStatus,
    val staffCount: Int,
    val netMinor: Long,
    val paidMinor: Long,
    val balanceMinor: Long,
    val approvalId: String?,
    val lines: List<PayrollLine> = emptyList(),
)
