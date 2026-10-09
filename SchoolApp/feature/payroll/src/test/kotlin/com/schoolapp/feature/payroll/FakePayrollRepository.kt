package com.schoolapp.feature.payroll

import com.schoolapp.core.common.result.AppError
import com.schoolapp.core.common.result.AppResult
import com.schoolapp.core.data.payroll.PayrollRepository
import com.schoolapp.core.model.payroll.PayAttendance
import com.schoolapp.core.model.payroll.PayBreakdown
import com.schoolapp.core.model.payroll.PayItem
import com.schoolapp.core.model.payroll.PayOvertime
import com.schoolapp.core.model.payroll.PayrollRun
import com.schoolapp.core.model.payroll.PayrollRunStatus
import com.schoolapp.core.model.payroll.Payslip
import com.schoolapp.core.model.payroll.PayslipLineItem

class FakePayrollRepository : PayrollRepository {
    val payslips = mutableMapOf<String, Payslip>()
    var runs = mutableListOf<PayrollRun>()
    var payslipError: AppError? = null
    var approvalError: AppError? = null
    val payslipCalls = mutableListOf<String>()
    val runsCalls = mutableListOf<String?>()
    val approvalCalls = mutableListOf<String>()

    override suspend fun myPayslip(month: String): AppResult<Payslip?> {
        payslipCalls += month
        payslipError?.let { return AppResult.Failure(it) }
        return AppResult.Success(payslips[month])
    }

    override suspend fun runs(branchId: String?, month: String?): AppResult<List<PayrollRun>> {
        runsCalls += branchId
        return AppResult.Success(runs.toList())
    }

    override suspend fun run(id: String): AppResult<PayrollRun> =
        runs.firstOrNull { it.id == id }?.let { AppResult.Success(it) } ?: AppResult.Failure(AppError.Network)

    override suspend fun requestApproval(id: String): AppResult<Unit> {
        approvalCalls += id
        approvalError?.let { return AppResult.Failure(it) }
        runs = runs.map { if (it.id == id) it.copy(approvalId = "ap-$id") else it }.toMutableList()
        return AppResult.Success(Unit)
    }
}

fun payslip(month: String) = Payslip(
    month = month, staffName = "Sara Ali", designation = "Teacher", basicMinor = 6_500_000,
    allowances = listOf(PayItem("House rent", 1_000_000)), deductions = listOf(PayItem("Provident fund", 300_000)),
    allowancesMinor = 1_000_000, deductionsMinor = 300_000, unpaidLeaveDays = 0.0, leaveDeductionMinor = 0,
    adjustmentsMinor = 0, netMinor = 7_200_000, paidMinor = 7_200_000, balanceMinor = 0, status = "PAID", pdfUrl = null, currency = "PKR",
    breakdown = PayBreakdown(
        earnings = listOf(
            PayslipLineItem("Basic salary", null, 6_500_000),
            PayslipLineItem("House rent", null, 1_000_000),
            PayslipLineItem("Overtime", "3 h × PKR 512.82 an hour (1.5× basic hourly)", 153_846),
        ),
        deductionItems = listOf(PayslipLineItem("Absent days", "2 absent days: 2 days × PKR 2,629.63 a day", 453_846)),
        totalEarningsMinor = 7_653_846, totalDeductionsMinor = 453_846, overtimeMinutes = 180, overtimeMinor = 153_846,
        attendance = PayAttendance(payDays = 27, present = 22, late = 3, absent = 2, halfDays = 0, paidLeave = 1, unpaidLeave = 0),
        overtime = PayOvertime(minutes = 180, hourlyRateMinor = 51_282, amountMinor = 153_846, pendingMinutes = 0),
    ),
)

fun run(id: String, month: String, status: PayrollRunStatus, approvalId: String? = null) =
    PayrollRun(id, "Main Branch", month, status, 6, 40_000_000, 0, 40_000_000, approvalId)
