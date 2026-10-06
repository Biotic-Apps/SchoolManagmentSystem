package com.schoolapp.core.data.payroll

import com.schoolapp.core.common.result.AppResult
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
}
