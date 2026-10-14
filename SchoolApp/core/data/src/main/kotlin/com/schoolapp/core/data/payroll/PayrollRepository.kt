package com.schoolapp.core.data.payroll

import com.schoolapp.core.common.result.AppResult
import com.schoolapp.core.model.payroll.PayrollPaymentInput
import com.schoolapp.core.model.payroll.PayrollRun
import com.schoolapp.core.model.payroll.Payslip

interface PayrollRepository {
    /** Own payslip for [month] (`YYYY-MM`); null when none was issued for that month. */
    suspend fun myPayslip(month: String): AppResult<Payslip?>

    /** Newest month first. */
    suspend fun runs(branchId: String? = null, month: String? = null): AppResult<List<PayrollRun>>

    suspend fun run(id: String): AppResult<PayrollRun>

    /** Raises the PAYROLL approval for a REVIEWED run; it is then decided from Approvals. */
    suspend fun requestApproval(id: String): AppResult<Unit>

    /** New DRAFT run; fails with HTTP 409 when the branch already has one for [month]. */
    suspend fun createRun(branchId: String, month: String): AppResult<PayrollRun>

    /** Starts the calculation; returns the background job id (null when the API calculated inline). */
    suspend fun calculate(runId: String): AppResult<String?>

    /** Waits for a background job started by [calculate]. */
    suspend fun awaitJob(jobId: String): AppResult<Unit>

    suspend fun markReviewed(runId: String): AppResult<Unit>

    suspend fun close(runId: String): AppResult<Unit>

    suspend fun recordPayment(runId: String, input: PayrollPaymentInput): AppResult<Unit>

    /** A staff member's payslip for [month]; null when none exists. */
    suspend fun staffPayslip(staffId: String, month: String): AppResult<Payslip?>

    /** Every payslip of the run in one PDF (drafts are watermarked); returns a content uri to open. */
    suspend fun runPayslipsPdf(runId: String, month: String): AppResult<String>
}

