package com.schoolapp.core.data.payroll

import com.schoolapp.core.common.result.AppError
import com.schoolapp.core.common.result.AppResult
import com.schoolapp.core.model.payroll.PayrollRun
import com.schoolapp.core.model.payroll.Payslip
import com.schoolapp.core.network.ApiCaller
import com.schoolapp.core.network.api.PayrollApi
import javax.inject.Inject
import javax.inject.Singleton

@Singleton
class DefaultPayrollRepository @Inject constructor(
    private val api: PayrollApi,
    private val apiCaller: ApiCaller,
) : PayrollRepository {

    override suspend fun myPayslip(month: String): AppResult<Payslip?> =
        when (val result = apiCaller.call { api.myPayslip(month).data.toModel() }) {
            is AppResult.Success -> result
            is AppResult.Failure -> {
                val error = result.error
                if (error is AppError.Server && error.httpCode == HTTP_NOT_FOUND) AppResult.Success(null) else result
            }
        }

    override suspend fun runs(branchId: String?, month: String?): AppResult<List<PayrollRun>> =
        apiCaller.call { api.runs(branchId, month).data.map { it.toModel() }.sortedByDescending { it.month } }

    override suspend fun run(id: String): AppResult<PayrollRun> = apiCaller.call { api.run(id).data.toModel() }

    override suspend fun requestApproval(id: String): AppResult<Unit> = apiCaller.call {
        api.requestApproval(id)
        Unit
    }

    private companion object {
        const val HTTP_NOT_FOUND = 404
    }
}
