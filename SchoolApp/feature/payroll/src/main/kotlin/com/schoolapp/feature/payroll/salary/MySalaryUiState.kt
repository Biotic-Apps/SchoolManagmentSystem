package com.schoolapp.feature.payroll.salary

import androidx.compose.runtime.Immutable
import com.schoolapp.core.common.result.AppError
import com.schoolapp.core.model.payroll.Payslip
import java.time.YearMonth

@Immutable
data class MySalaryUiState(
    val month: YearMonth,
    val currentMonth: YearMonth,
    val isLoading: Boolean = true,
    val error: AppError? = null,
    val payslip: Payslip? = null,
) {
    /** Salary is always shown behind FLAG_SECURE. */
    val secure: Boolean get() = true

    val canGoNext: Boolean get() = month < currentMonth

    val isEmpty: Boolean get() = !isLoading && error == null && payslip == null
}
