package com.schoolapp.feature.payroll.run

import androidx.compose.runtime.Immutable
import com.schoolapp.core.common.result.AppError
import com.schoolapp.core.model.payroll.PayrollRun
import com.schoolapp.core.model.payroll.PayrollRunStatus

@Immutable
data class PayrollRunUiState(
    val isLoading: Boolean = true,
    val error: AppError? = null,
    val run: PayrollRun? = null,
) {
    /** Staff salaries are listed, so the window is always FLAG_SECURE. */
    val secure: Boolean get() = true

    val isWaitingForApproval: Boolean get() = run?.approvalId != null && run.status == PayrollRunStatus.REVIEWED
}
