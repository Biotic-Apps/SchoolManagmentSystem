package com.schoolapp.feature.payroll.runs

import androidx.compose.runtime.Immutable
import com.schoolapp.core.common.result.AppError
import com.schoolapp.core.model.payroll.PayrollRun
import com.schoolapp.core.model.payroll.PayrollRunStatus

@Immutable
data class PayrollRunsUiState(
    val isLoading: Boolean = true,
    val isRefreshing: Boolean = false,
    val error: AppError? = null,
    val runs: List<PayrollRun> = emptyList(),
    val canApprove: Boolean = false,
    val sendingId: String? = null,
    val sentRunId: String? = null,
    val actionError: AppError? = null,
) {
    /** REVIEWED runs not yet in Approvals can be sent by a `payroll.approve` holder. */
    fun canSend(run: PayrollRun): Boolean = canApprove && run.status == PayrollRunStatus.REVIEWED && run.approvalId == null

    /** A run raised for approval that is still waiting for the decision. */
    fun isWaiting(run: PayrollRun): Boolean = run.approvalId != null && run.status == PayrollRunStatus.REVIEWED
}
