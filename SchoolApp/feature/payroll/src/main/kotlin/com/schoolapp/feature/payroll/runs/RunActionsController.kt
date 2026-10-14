package com.schoolapp.feature.payroll.runs

import com.schoolapp.core.common.result.AppResult
import com.schoolapp.core.data.payroll.PayrollRepository
import com.schoolapp.feature.payroll.runs.overview.RunActionCallbacks
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.update
import kotlinx.coroutines.launch

/**
 * Status- and permission-gated run workflow: calculate (background job), mark reviewed, send for approval,
 * close, and print every payslip. One action runs at a time; [reload] refreshes the run afterwards.
 */
class RunActionsController internal constructor(
    private val scope: CoroutineScope,
    private val repository: PayrollRepository,
    private val state: MutableStateFlow<MonthlyPayrollUiState>,
    private val reload: () -> Unit,
) {
    internal val callbacks: RunActionCallbacks by lazy {
        RunActionCallbacks(::calculate, ::printAll, ::markReviewed, ::askSendForApproval, ::askClose)
    }

    fun calculate() {
        val s = state.value
        val run = s.run ?: return
        if (!s.canCalculate || s.busy != null || s.calculating) return
        start(RunAction.CALCULATE)
        scope.launch {
            when (val started = repository.calculate(run.id)) {
                is AppResult.Failure -> fail(started)
                is AppResult.Success -> {
                    val jobId = started.data
                    if (jobId == null) {
                        done(RunNotice.CALCULATED)
                        return@launch
                    }
                    state.update { it.copy(busy = null, calculating = true) }
                    val waited = repository.awaitJob(jobId)
                    state.update { it.copy(calculating = false) }
                    if (waited is AppResult.Failure) fail(waited) else done(RunNotice.CALCULATED)
                }
            }
        }
    }

    fun markReviewed() = simple(RunAction.REVIEW, RunNotice.REVIEWED, { state.value.canReview }) { repository.markReviewed(it) }

    fun askSendForApproval() {
        if (state.value.canSendForApproval) state.update { it.copy(confirm = RunConfirm.APPROVE) }
    }

    fun askClose() {
        if (state.value.canClose && state.value.closeEnabled) state.update { it.copy(confirm = RunConfirm.CLOSE) }
    }

    fun dismissConfirm() = state.update { it.copy(confirm = null) }

    fun confirm() {
        val confirm = state.value.confirm ?: return
        state.update { it.copy(confirm = null) }
        when (confirm) {
            RunConfirm.APPROVE ->
                simple(RunAction.APPROVE, RunNotice.SENT, { state.value.canSendForApproval }) { repository.requestApproval(it) }
            RunConfirm.CLOSE ->
                simple(RunAction.CLOSE, RunNotice.CLOSED, { state.value.canClose && state.value.closeEnabled }) { repository.close(it) }
        }
    }

    /** Downloads the run's payslips PDF (drafts are watermarked until approval) for the screen to open. */
    fun printAll() {
        val s = state.value
        val run = s.run ?: return
        if (!s.canPrint || s.busy != null) return
        start(RunAction.PRINT)
        scope.launch {
            when (val result = repository.runPayslipsPdf(run.id, run.month)) {
                is AppResult.Success -> state.update { it.copy(busy = null, pdfToOpen = result.data) }
                is AppResult.Failure -> state.update { it.copy(busy = null, actionError = result.error) }
            }
        }
    }

    fun onPdfOpened() = state.update { it.copy(pdfToOpen = null) }

    private fun simple(action: RunAction, notice: RunNotice, allowed: () -> Boolean, call: suspend (String) -> AppResult<Unit>) {
        val run = state.value.run ?: return
        if (!allowed() || state.value.busy != null) return
        start(action)
        scope.launch {
            when (val result = call(run.id)) {
                is AppResult.Success -> done(notice)
                is AppResult.Failure -> fail(result)
            }
        }
    }

    private fun start(action: RunAction) = state.update { it.copy(busy = action, notice = null, actionError = null) }

    private fun done(notice: RunNotice) {
        state.update { it.copy(busy = null, notice = notice) }
        reload()
    }

    private fun fail(result: AppResult.Failure) {
        state.update { it.copy(busy = null, actionError = result.error) }
        reload()
    }
}
