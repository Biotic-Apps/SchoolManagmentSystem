package com.schoolapp.feature.payroll.runs.breakdown

import com.schoolapp.core.common.result.AppResult
import com.schoolapp.core.data.payroll.PayrollRepository
import com.schoolapp.feature.payroll.runs.MonthlyPayrollUiState
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Job
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.update
import kotlinx.coroutines.launch

/** Salary breakdown of one line; once the run is approved the payslip is fetched for its PDF link. */
class BreakdownController internal constructor(
    private val scope: CoroutineScope,
    private val repository: PayrollRepository,
    private val state: MutableStateFlow<MonthlyPayrollUiState>,
) {
    private var job: Job? = null

    fun open(staffId: String) {
        val s = state.value
        if (s.line(staffId) == null) return
        state.update { it.copy(payment = null, breakdown = BreakdownState(staffId, isLoadingPdf = s.approved)) }
        if (s.approved) loadPdf(staffId)
    }

    fun retryPdf() = state.value.breakdown?.let { open(it.staffId) }

    fun dismiss() {
        job?.cancel()
        state.update { it.copy(breakdown = null) }
    }

    private fun loadPdf(staffId: String) {
        val month = state.value.run?.month ?: return
        job?.cancel()
        job = scope.launch {
            val result = repository.staffPayslip(staffId, month)
            state.update { s ->
                val current = s.breakdown?.takeIf { it.staffId == staffId } ?: return@update s
                val next = when (result) {
                    is AppResult.Success -> current.copy(
                        isLoadingPdf = false,
                        pdfUrl = result.data?.pdfUrl?.takeIf { it.isNotBlank() },
                        pdfPending = result.data?.pdfStatus.equals("PENDING", ignoreCase = true),
                    )
                    is AppResult.Failure -> current.copy(isLoadingPdf = false, pdfError = result.error)
                }
                s.copy(breakdown = next)
            }
        }
    }
}
