package com.schoolapp.feature.fees.invoice.staff

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.outlined.Block
import androidx.compose.material.icons.outlined.FamilyRestroom
import androidx.compose.material.icons.automirrored.outlined.Send
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.unit.dp
import androidx.hilt.lifecycle.viewmodel.compose.hiltViewModel
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import com.schoolapp.core.designsystem.component.AppBottomSheet
import com.schoolapp.core.designsystem.component.AppTextArea
import com.schoolapp.core.designsystem.component.InlineMessage
import com.schoolapp.core.designsystem.component.SecondaryButton
import com.schoolapp.core.designsystem.component.StatusTone
import com.schoolapp.core.designsystem.theme.AppColors
import com.schoolapp.core.model.fees.Invoice
import com.schoolapp.core.model.fees.InvoiceStatus
import com.schoolapp.core.ui.appErrorMessage
import com.schoolapp.feature.fees.R
import com.schoolapp.feature.fees.components.rememberPdfOpener
import com.schoolapp.feature.fees.staff.structure.SheetFooter

/** Staff-only part of the invoice screen; renders nothing for parents. */
@Composable
internal fun InvoiceStaffActions(
    invoice: Invoice,
    onChanged: () -> Unit,
    viewModel: InvoiceStaffViewModel = hiltViewModel(),
) {
    val state by viewModel.uiState.collectAsStateWithLifecycle()
    val pdf = rememberPdfOpener()
    LaunchedEffect(state.pdfToOpen) {
        state.pdfToOpen?.let {
            viewModel.onPdfOpened()
            pdf.open(it)
        }
    }
    if (!state.isStaff) return
    val open = invoice.status != InvoiceStatus.CANCELLED
    Column(Modifier.fillMaxWidth(), verticalArrangement = Arrangement.spacedBy(8.dp)) {
        state.notice?.let { InlineMessage(noticeText(it), StatusTone.Success) }
        state.error?.let { InlineMessage(appErrorMessage(it), StatusTone.Error) }
        if (state.canIssue && invoice.status == InvoiceStatus.DRAFT) {
            SecondaryButton(
                stringResource(R.string.fees_inv_issue), { viewModel.issue(invoice, onChanged) },
                Modifier.fillMaxWidth(), loading = state.busy && !state.cancelOpen, leadingIcon = Icons.AutoMirrored.Outlined.Send,
            )
        }
        if (state.branchId != null && invoice.studentId != null) {
            SecondaryButton(
                stringResource(R.string.fees_inv_family_challan), { viewModel.familyChallan(invoice) },
                Modifier.fillMaxWidth(), loading = state.familyBusy, leadingIcon = Icons.Outlined.FamilyRestroom,
            )
        }
        if (state.canCancel && open) {
            SecondaryButton(
                stringResource(R.string.fees_inv_cancel), viewModel::openCancel,
                Modifier.fillMaxWidth(), leadingIcon = Icons.Outlined.Block, contentColor = AppColors.Error,
            )
        }
    }
    if (state.cancelOpen) {
        AppBottomSheet(title = stringResource(R.string.fees_inv_cancel_title, invoice.invoiceNo), onDismiss = viewModel::dismissCancel) {
            Text(stringResource(R.string.fees_inv_cancel_help), style = MaterialTheme.typography.bodyMedium, color = AppColors.TextSecondary)
            AppTextArea(
                value = state.cancelReason,
                onValueChange = viewModel::onCancelReason,
                label = stringResource(R.string.fees_inv_reason),
                errorText = if (state.cancelInvalid) stringResource(R.string.fees_inv_reason_invalid) else null,
                enabled = !state.busy,
                minLines = 2,
            )
            SheetFooter(
                state.error, state.busy, { viewModel.confirmCancel(invoice, onChanged) }, viewModel::dismissCancel,
                saveLabel = stringResource(R.string.fees_inv_cancel),
            )
        }
    }
}

@Composable
private fun noticeText(notice: InvoiceStaffNotice): String = stringResource(
    when (notice) {
        InvoiceStaffNotice.ISSUED -> R.string.fees_inv_issued_one
        InvoiceStaffNotice.CANCELLED -> R.string.fees_inv_cancelled
        InvoiceStaffNotice.CANCEL_SENT -> R.string.fees_inv_cancel_sent
    },
)
