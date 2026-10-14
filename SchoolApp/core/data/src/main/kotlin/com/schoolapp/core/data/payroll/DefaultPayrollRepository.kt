package com.schoolapp.core.data.payroll

import com.schoolapp.core.common.result.AppError
import com.schoolapp.core.common.result.AppResult
import com.schoolapp.core.data.fees.pdf.BackgroundJobs
import com.schoolapp.core.data.fees.pdf.PdfFileStore
import com.schoolapp.core.model.payroll.PayrollPaymentInput
import com.schoolapp.core.model.payroll.PayrollRun
import com.schoolapp.core.model.payroll.Payslip
import com.schoolapp.core.network.ApiCaller
import com.schoolapp.core.network.api.PayrollApi
import com.schoolapp.core.network.dto.payroll.CreatePayrollRunRequest
import com.schoolapp.core.network.dto.payroll.PayrollPaymentRequest
import com.schoolapp.core.network.dto.payroll.PayslipDto
import javax.inject.Inject
import javax.inject.Singleton

@Singleton
class DefaultPayrollRepository @Inject constructor(
    private val api: PayrollApi,
    private val apiCaller: ApiCaller,
    private val jobs: BackgroundJobs,
    private val pdfFiles: PdfFileStore,
) : PayrollRepository {

    override suspend fun myPayslip(month: String): AppResult<Payslip?> = payslipOrNull { api.myPayslip(month).data }

    override suspend fun staffPayslip(staffId: String, month: String): AppResult<Payslip?> =
        payslipOrNull { api.staffPayslip(staffId, month).data }

    override suspend fun runs(branchId: String?, month: String?): AppResult<List<PayrollRun>> =
        apiCaller.call { api.runs(branchId, month).data.map { it.toModel() }.sortedByDescending { it.month } }

    override suspend fun run(id: String): AppResult<PayrollRun> = apiCaller.call { api.run(id).data.toModel() }

    override suspend fun requestApproval(id: String): AppResult<Unit> = apiCaller.call {
        api.requestApproval(id)
        Unit
    }

    override suspend fun createRun(branchId: String, month: String): AppResult<PayrollRun> =
        apiCaller.call { api.createRun(CreatePayrollRunRequest(branchId, month)).data.toModel() }

    override suspend fun calculate(runId: String): AppResult<String?> =
        apiCaller.call { api.calculate(runId).data.jobId?.takeIf { it.isNotBlank() } }

    override suspend fun awaitJob(jobId: String): AppResult<Unit> = when (val result = jobs.await(jobId)) {
        is AppResult.Success -> AppResult.Success(Unit)
        is AppResult.Failure -> result
    }

    override suspend fun markReviewed(runId: String): AppResult<Unit> = apiCaller.call {
        api.review(runId)
        Unit
    }

    override suspend fun close(runId: String): AppResult<Unit> = apiCaller.call {
        api.close(runId)
        Unit
    }

    override suspend fun recordPayment(runId: String, input: PayrollPaymentInput): AppResult<Unit> = apiCaller.call {
        api.recordPayment(
            runId,
            PayrollPaymentRequest(
                staffId = input.staffId,
                amountMinor = input.amountMinor,
                method = input.method.name,
                reference = input.reference?.trim()?.takeIf { it.isNotEmpty() },
                paidOn = input.paidOn,
            ),
        )
        Unit
    }

    override suspend fun runPayslipsPdf(runId: String, month: String): AppResult<String> =
        pdfFiles.get("payroll/runs/$runId/payslips-pdf", "payslips-$month.pdf")

    /** A month without a payslip (404) resolves to null instead of an error. */
    private suspend fun payslipOrNull(fetch: suspend () -> PayslipDto): AppResult<Payslip?> =
        when (val result = apiCaller.call { fetch().toModel() }) {
            is AppResult.Success -> result
            is AppResult.Failure -> {
                val error = result.error
                if (error is AppError.Server && error.httpCode == HTTP_NOT_FOUND) AppResult.Success(null) else result
            }
        }

    private companion object {
        const val HTTP_NOT_FOUND = 404
    }
}
