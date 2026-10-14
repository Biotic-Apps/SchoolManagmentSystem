package com.schoolapp.feature.payroll.runs.breakdown

import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.outlined.Download
import androidx.compose.material3.HorizontalDivider
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.res.stringResource
import com.schoolapp.core.designsystem.component.AppBottomSheet
import com.schoolapp.core.designsystem.component.InlineMessage
import com.schoolapp.core.designsystem.component.MoneyRow
import com.schoolapp.core.designsystem.component.SecondaryButton
import com.schoolapp.core.designsystem.component.StatusChip
import com.schoolapp.core.designsystem.component.StatusTone
import com.schoolapp.core.designsystem.theme.AppColors
import com.schoolapp.core.model.payroll.PayrollLine
import com.schoolapp.core.ui.appErrorMessage
import com.schoolapp.feature.payroll.R
import com.schoolapp.feature.payroll.components.designationLabel
import com.schoolapp.feature.payroll.components.monthLabel
import com.schoolapp.feature.payroll.components.payrollStatusLabel
import com.schoolapp.feature.payroll.components.payrollTone
import com.schoolapp.feature.payroll.salary.PayAttendanceStrip
import com.schoolapp.feature.payroll.salary.PayBreakdownSection

/** One line's month: attendance, itemised earnings and deductions with the working, pay, and the payslip PDF. */
@Composable
internal fun LineBreakdownSheet(
    line: PayrollLine,
    month: String,
    currency: String,
    approved: Boolean,
    state: BreakdownState,
    onDownload: (String) -> Unit,
    onRetryPdf: () -> Unit,
    onDismiss: () -> Unit,
) {
    AppBottomSheet(title = stringResource(R.string.payroll_breakdown_title, line.name), onDismiss = onDismiss) {
        Text(
            listOfNotNull(designationLabel(line.designation), monthLabel(month)).joinToString(" · "),
            style = MaterialTheme.typography.bodyMedium,
            color = AppColors.TextSecondary,
        )
        line.status?.let { StatusChip(payrollStatusLabel(it), payrollTone(it)) }
        line.breakdown.attendance?.let { PayAttendanceStrip(it, line.breakdown.overtimeMinutes) }
        val items = lineBreakdownItems(line)
        if (items.earnings.isEmpty()) Muted(stringResource(R.string.payroll_no_earnings))
        PayBreakdownSection(
            title = stringResource(R.string.payroll_earnings), items = items.earnings,
            totalLabel = stringResource(R.string.payroll_total_earnings), totalMinor = items.totalEarnings,
            currency = currency, negative = false,
        )
        if (items.deductions.isEmpty()) Muted(stringResource(R.string.payroll_nothing_deducted))
        PayBreakdownSection(
            title = stringResource(R.string.payroll_deductions), items = items.deductions,
            totalLabel = stringResource(R.string.payroll_total_deductions), totalMinor = items.totalDeductions,
            currency = currency, negative = true,
        )
        HorizontalDivider(color = AppColors.Border)
        Text(stringResource(R.string.payroll_pay_section), style = MaterialTheme.typography.labelLarge, color = AppColors.TextPrimary)
        MoneyRow(stringResource(R.string.payroll_net), line.netMinor, currency = currency, emphasized = true)
        MoneyRow(stringResource(R.string.payroll_paid_so_far), line.paidMinor, currency = currency)
        MoneyRow(
            stringResource(R.string.payroll_still_to_pay), line.balanceMinor, currency = currency, emphasized = true,
            amountColor = if (line.balanceMinor > 0) AppColors.Warning else AppColors.TextPrimary,
        )
        if (approved) PdfAction(state, onDownload, onRetryPdf) else InlineMessage(stringResource(R.string.payroll_payslip_draft_note), StatusTone.Info)
    }
}

@Composable
private fun PdfAction(state: BreakdownState, onDownload: (String) -> Unit, onRetryPdf: () -> Unit) {
    val url = state.pdfUrl
    when {
        state.pdfError != null -> {
            InlineMessage(appErrorMessage(state.pdfError), StatusTone.Error)
            SecondaryButton(stringResource(R.string.payroll_download_payslip_pdf), onRetryPdf, leadingIcon = Icons.Outlined.Download)
        }
        url != null -> SecondaryButton(stringResource(R.string.payroll_download_payslip_pdf), { onDownload(url) }, leadingIcon = Icons.Outlined.Download)
        state.isLoadingPdf || state.pdfPending -> SecondaryButton(
            stringResource(R.string.payroll_preparing_payslip_pdf), {}, enabled = false, loading = state.isLoadingPdf,
            leadingIcon = Icons.Outlined.Download,
        )
        else -> {
            InlineMessage(stringResource(R.string.payroll_payslip_pdf_not_ready), StatusTone.Info)
            SecondaryButton(stringResource(R.string.payroll_download_payslip_pdf), onRetryPdf, leadingIcon = Icons.Outlined.Download)
        }
    }
}

@Composable
private fun Muted(text: String) {
    Text(text, style = MaterialTheme.typography.bodySmall, color = AppColors.TextSecondary)
}
