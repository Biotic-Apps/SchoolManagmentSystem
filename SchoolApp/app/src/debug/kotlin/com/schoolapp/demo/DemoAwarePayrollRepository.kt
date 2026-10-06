package com.schoolapp.demo

import com.schoolapp.core.common.result.AppError
import com.schoolapp.core.common.result.AppResult
import com.schoolapp.core.data.payroll.DefaultPayrollRepository
import com.schoolapp.core.data.payroll.PayrollRepository
import com.schoolapp.core.model.payroll.PayrollRun
import com.schoolapp.core.model.payroll.PayrollRunStatus
import com.schoolapp.core.model.payroll.Payslip
import kotlinx.coroutines.flow.update
import javax.inject.Inject
import javax.inject.Singleton

@Singleton
class DemoAwarePayrollRepository @Inject constructor(
    private val real: DefaultPayrollRepository,
    private val auth: DemoAwareAuthRepository,
) : PayrollRepository {

    override suspend fun myPayslip(month: String): AppResult<Payslip?> {
        if (!auth.isDemoActive) return real.myPayslip(month)
        val me = DemoActors.forRole(auth.demoSession.value?.activeRole)
        return AppResult.Success(DemoPayrollData.payslip(month, me.name))
    }

    override suspend fun runs(branchId: String?, month: String?): AppResult<List<PayrollRun>> {
        if (!auth.isDemoActive) return real.runs(branchId, month)
        val runs = DemoPayrollData.runs.value.filter { month == null || it.month == month }
        return AppResult.Success(runs.map { it.copy(lines = emptyList()) }.sortedByDescending { it.month })
    }

    override suspend fun run(id: String): AppResult<PayrollRun> {
        if (!auth.isDemoActive) return real.run(id)
        return DemoPayrollData.runs.value.firstOrNull { it.id == id }?.let { AppResult.Success(it) }
            ?: AppResult.Failure(AppError.Server(NOT_FOUND, "NOT_FOUND", null))
    }

    override suspend fun requestApproval(id: String): AppResult<Unit> {
        if (!auth.isDemoActive) return real.requestApproval(id)
        val run = DemoPayrollData.runs.value.firstOrNull { it.id == id }
            ?: return AppResult.Failure(AppError.Server(NOT_FOUND, "NOT_FOUND", null))
        if (run.status != PayrollRunStatus.REVIEWED || run.approvalId != null) {
            return AppResult.Failure(AppError.Server(CONFLICT, "INVALID_STATE", "Only a reviewed run can be sent for approval."))
        }
        DemoPayrollData.runs.update { runs -> runs.map { if (it.id == id) it.copy(approvalId = "demo-ap-payroll-$id") else it } }
        return AppResult.Success(Unit)
    }

    private companion object {
        const val NOT_FOUND = 404
        const val CONFLICT = 409
    }
}
