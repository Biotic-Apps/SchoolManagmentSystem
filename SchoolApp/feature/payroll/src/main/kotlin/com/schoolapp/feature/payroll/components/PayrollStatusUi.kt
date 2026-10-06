package com.schoolapp.feature.payroll.components

import androidx.compose.runtime.Composable
import androidx.compose.ui.res.stringResource
import com.schoolapp.core.designsystem.component.StatusTone
import com.schoolapp.core.model.payroll.PayrollRunStatus
import com.schoolapp.core.ui.humanizeKey
import com.schoolapp.feature.payroll.R

/** Run and payslip status keys share the run lifecycle (DRAFT … CLOSED). */
internal fun payrollTone(status: String?): StatusTone = when (status?.uppercase()) {
    "PAID", "CLOSED" -> StatusTone.Success
    "APPROVED", "REVIEWED" -> StatusTone.Info
    "PARTIALLY_PAID", "CALCULATED" -> StatusTone.Warning
    else -> StatusTone.Neutral
}

@Composable
internal fun payrollStatusLabel(status: String?): String {
    val known = PayrollRunStatus.entries.firstOrNull { it.name == status?.uppercase() }
    return known?.let { stringResource(it.labelRes()) } ?: humanizeKey(status.orEmpty())
}

private fun PayrollRunStatus.labelRes(): Int = when (this) {
    PayrollRunStatus.DRAFT -> R.string.payroll_status_draft
    PayrollRunStatus.CALCULATED -> R.string.payroll_status_calculated
    PayrollRunStatus.REVIEWED -> R.string.payroll_status_reviewed
    PayrollRunStatus.APPROVED -> R.string.payroll_status_approved
    PayrollRunStatus.PARTIALLY_PAID -> R.string.payroll_status_partially_paid
    PayrollRunStatus.PAID -> R.string.payroll_status_paid
    PayrollRunStatus.CLOSED -> R.string.payroll_status_closed
}

/** "1.5" / "2" without a trailing ".0". */
internal fun formatDays(days: Double): String =
    if (days % 1.0 == 0.0) days.toLong().toString() else days.toString()
