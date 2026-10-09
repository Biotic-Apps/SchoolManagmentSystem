package com.schoolapp.feature.fees.invoice

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.outlined.CreditCard
import androidx.compose.material.icons.outlined.FileDownload
import androidx.compose.material.icons.outlined.UploadFile
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.unit.dp
import com.schoolapp.core.common.result.AppError
import com.schoolapp.core.designsystem.component.ErrorState
import com.schoolapp.core.designsystem.component.InlineMessage
import com.schoolapp.core.designsystem.component.LoadingState
import com.schoolapp.core.designsystem.component.PrimaryButton
import com.schoolapp.core.designsystem.component.ScreenColumn
import com.schoolapp.core.designsystem.component.SecondaryButton
import com.schoolapp.core.designsystem.component.StatusTone
import com.schoolapp.core.ui.appErrorMessage
import com.schoolapp.core.ui.fileJobMessage
import com.schoolapp.feature.fees.R
import com.schoolapp.feature.fees.invoice.components.InvoiceBreakdownCard
import com.schoolapp.feature.fees.invoice.components.InvoiceHeaderCard
import com.schoolapp.feature.fees.invoice.components.InvoicePaymentsCard

@Composable
internal fun InvoiceDetailScreen(
    state: InvoiceDetailUiState,
    onRetry: () -> Unit,
    onReceipt: (String) -> Unit,
    onUploadProof: () -> Unit,
    onPayOnline: () -> Unit,
    modifier: Modifier = Modifier,
    onDownloadChallan: () -> Unit = {},
) {
    val invoice = state.invoice
    when {
        invoice == null && state.isLoading -> LoadingState(modifier)
        invoice == null -> ErrorState(state.error?.let { appErrorMessage(it) }.orEmpty(), modifier, onRetry = onRetry)
        else -> ScreenColumn(modifier) {
            item(key = "header") { InvoiceHeaderCard(invoice) }
            item(key = "breakdown") { InvoiceBreakdownCard(invoice) }
            item(key = "actions") {
                Column(verticalArrangement = Arrangement.spacedBy(8.dp)) {
                    if (state.canPayOnline) {
                        PrimaryButton(
                            text = stringResource(R.string.fees_pay_online),
                            onClick = onPayOnline,
                            modifier = Modifier.fillMaxWidth(),
                            loading = state.isPayingOnline,
                            leadingIcon = Icons.Outlined.CreditCard,
                        )
                    }
                    state.payOnlineError?.let { InlineMessage(payOnlineMessage(it), StatusTone.Error) }
                    if (state.canUploadProof) {
                        SecondaryButton(
                            text = stringResource(R.string.fees_upload_proof),
                            onClick = onUploadProof,
                            modifier = Modifier.fillMaxWidth(),
                            leadingIcon = Icons.Outlined.UploadFile,
                        )
                    }
                    SecondaryButton(
                        text = stringResource(R.string.fees_download_challan),
                        onClick = onDownloadChallan,
                        modifier = Modifier.fillMaxWidth(),
                        loading = state.isDownloadingChallan,
                        leadingIcon = Icons.Outlined.FileDownload,
                    )
                    state.challanError?.let { InlineMessage(fileJobMessage(it), StatusTone.Error) }
                }
            }
            item(key = "payments") {
                InvoicePaymentsCard(
                    payments = invoice.payments,
                    currency = invoice.currency,
                    busyPaymentId = state.receiptBusyId,
                    problem = state.receiptProblem,
                    onReceipt = onReceipt,
                )
            }
        }
    }
}

@Composable
private fun payOnlineMessage(error: AppError): String =
    if (error is AppError.Server && error.code == GATEWAY_DISABLED) stringResource(R.string.fees_gateway_disabled) else appErrorMessage(error)

private const val GATEWAY_DISABLED = "GATEWAY_DISABLED"
