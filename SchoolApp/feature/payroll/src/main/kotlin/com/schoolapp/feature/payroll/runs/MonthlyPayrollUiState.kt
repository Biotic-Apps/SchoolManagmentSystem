package com.schoolapp.feature.payroll.runs

import androidx.compose.runtime.Immutable
import com.schoolapp.core.common.result.AppError
import com.schoolapp.core.model.payroll.PayrollLine
import com.schoolapp.core.model.payroll.PayrollRun
import com.schoolapp.core.model.payroll.PayrollRunStatus
import com.schoolapp.feature.payroll.runs.breakdown.BreakdownState
import com.schoolapp.feature.payroll.runs.payment.PaymentForm
import java.time.YearMonth

/** What the payroll role may do (`payroll.add` / `payroll.edit` / `payroll.approve`). */
@Immutable
data class PayrollPermissions(val canAdd: Boolean = false, val canEdit: Boolean = false, val canApprove: Boolean = false)

/** A run action in flight (one at a time). */
enum class RunAction { CALCULATE, REVIEW, APPROVE, CLOSE, PRINT }

/** Confirm dialogs before irreversible steps. */
enum class RunConfirm { APPROVE, CLOSE }

/** Success / info banners after an action. */
enum class RunNotice { CREATED, ALREADY_EXISTS, CALCULATED, REVIEWED, SENT, CLOSED, PAID }

@Immutable
data class MonthlyPayrollUiState(
    val month: YearMonth,
    val currentMonth: YearMonth,
    /** Opened from a run link: no month stepper, the run is fixed. */
    val fixedRun: Boolean = false,
    val hasBranch: Boolean = false,
    val isLoading: Boolean = true,
    val isRefreshing: Boolean = false,
    val error: AppError? = null,
    val run: PayrollRun? = null,
    val staffType: String? = null,
    val permissions: PayrollPermissions = PayrollPermissions(),
    val creating: Boolean = false,
    val busy: RunAction? = null,
    /** The calculation job is running in the background. */
    val calculating: Boolean = false,
    val confirm: RunConfirm? = null,
    val notice: RunNotice? = null,
    val actionError: AppError? = null,
    /** Content uri of the downloaded "all payslips" PDF, opened once by the screen. */
    val pdfToOpen: String? = null,
    val breakdown: BreakdownState? = null,
    val payment: PaymentForm? = null,
) {
    /** Salaries are listed, so the window is always FLAG_SECURE. */
    val secure: Boolean get() = true

    val canGoNext: Boolean get() = month < currentMonth

    val allLines: List<PayrollLine> get() = run?.lines.orEmpty()

    val lines: List<PayrollLine> get() = staffType?.let { type -> allLines.filter { it.designation == type } } ?: allLines

    /** Staff types present in this run, known types first in their usual order. */
    val staffTypes: List<String>
        get() {
            val present = allLines.mapNotNull { it.designation }.distinct()
            return STAFF_TYPE_ORDER.filter { it in present } + present.filterNot { it in STAFF_TYPE_ORDER }.sorted()
        }

    val totals: RunTotals get() = RunTotals(lines.sumOf { it.netMinor }, lines.sumOf { it.paidMinor }, lines.sumOf { it.balanceMinor })

    private val status: PayrollRunStatus? get() = run?.status

    val awaitingApproval: Boolean get() = run?.awaitingApproval == true

    val canCalculate: Boolean
        get() = permissions.canEdit && status in CALCULABLE && !awaitingApproval

    val calculateIsFirst: Boolean get() = status == PayrollRunStatus.DRAFT

    val canPrint: Boolean get() = allLines.isNotEmpty()

    val canReview: Boolean get() = permissions.canEdit && status == PayrollRunStatus.CALCULATED

    val canSendForApproval: Boolean
        get() = permissions.canApprove && status == PayrollRunStatus.REVIEWED && !awaitingApproval

    val canClose: Boolean get() = permissions.canApprove && status in CLOSABLE

    /** Closing needs every salary fully paid. */
    val closeEnabled: Boolean get() = allLines.isNotEmpty() && allLines.all { it.balanceMinor <= 0 }

    /** Payslip PDFs exist once the run is approved. */
    val approved: Boolean get() = status in APPROVED_OR_LATER

    fun canPay(line: PayrollLine): Boolean = permissions.canEdit && status in PAYABLE && line.balanceMinor > 0

    fun line(staffId: String?): PayrollLine? = allLines.firstOrNull { it.staffId == staffId }

    companion object {
        val CALCULABLE = setOf(PayrollRunStatus.DRAFT, PayrollRunStatus.CALCULATED, PayrollRunStatus.REVIEWED)
        val CLOSABLE = setOf(PayrollRunStatus.APPROVED, PayrollRunStatus.PARTIALLY_PAID, PayrollRunStatus.PAID)
        val PAYABLE = setOf(PayrollRunStatus.APPROVED, PayrollRunStatus.PARTIALLY_PAID)
        val APPROVED_OR_LATER = CLOSABLE + PayrollRunStatus.CLOSED
        val STAFF_TYPE_ORDER = listOf(
            "PRINCIPAL", "HEAD_TEACHER", "COORDINATOR", "TEACHER", "ACCOUNTANT", "OFFICE_STAFF", "HELPER", "OTHER",
        )
    }
}

@Immutable
data class RunTotals(val netMinor: Long, val paidMinor: Long, val balanceMinor: Long)
