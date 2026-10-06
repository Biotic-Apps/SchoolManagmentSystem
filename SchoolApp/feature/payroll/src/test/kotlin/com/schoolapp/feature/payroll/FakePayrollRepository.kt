package com.schoolapp.feature.payroll

import com.schoolapp.core.common.result.AppError
import com.schoolapp.core.common.result.AppResult
import com.schoolapp.core.data.payroll.PayrollRepository
import com.schoolapp.core.model.payroll.PayItem
import com.schoolapp.core.model.payroll.PayrollRun
import com.schoolapp.core.model.payroll.PayrollRunStatus
import com.schoolapp.core.model.payroll.Payslip

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
)

fun run(id: String, month: String, status: PayrollRunStatus, approvalId: String? = null) =
    PayrollRun(id, "Main Branch", month, status, 6, 40_000_000, 0, 40_000_000, approvalId)
