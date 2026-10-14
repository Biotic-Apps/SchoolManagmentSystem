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
    val employeeNo: String? = null,
    /** Basic + allowances; 0 on lines from before the API sent it (use [gross]). */
    val grossMinor: Long = 0,
) {
    val gross: Long get() = grossMinor.takeIf { it > 0 } ?: (basicMinor + allowancesMinor)

    /** Itemised total, else gross plus positive adjustments (older lines). */
    val totalEarnings: Long
        get() = if (breakdown.hasItems) breakdown.totalEarningsMinor else gross + maxOf(0L, adjustmentsMinor)

    /** Itemised total, else structure deductions, unpaid leave and negative adjustments (older lines). */
    val totalDeductions: Long
        get() = if (breakdown.hasItems) {
            breakdown.totalDeductionsMinor
        } else {
            deductionsMinor + leaveDeductionMinor + maxOf(0L, -adjustmentsMinor)
        }
}

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
    /** Status of the run's approval request (PENDING / APPROVED / REJECTED), null when never sent. */
    val approvalStatus: String? = null,
    /** Overtime entries of the month still waiting for a decision (not paid by this run yet). */
    val pendingOvertimeCount: Int = 0,
    val currency: String = "PKR",
) {
    /** Sent for approval and not decided yet. */
    val awaitingApproval: Boolean
        get() = approvalStatus == "PENDING" || (approvalStatus == null && approvalId != null && status == PayrollRunStatus.REVIEWED)
}

/** How a salary was paid (API `method`). */
enum class SalaryPaymentMethod { CASH, BANK, CHEQUE }

/** POST /payroll/runs/:id/payments; [amountMinor] ≤ the line balance, [paidOn] `YYYY-MM-DD`. */
data class PayrollPaymentInput(
    val staffId: String,
    val amountMinor: Long,
    val method: SalaryPaymentMethod,
    val reference: String?,
    val paidOn: String,
)
