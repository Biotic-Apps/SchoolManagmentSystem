package com.schoolapp.feature.fees.invoice

import androidx.compose.runtime.Immutable
import com.schoolapp.core.common.result.AppError
import com.schoolapp.core.model.fees.FeeSummary
import com.schoolapp.core.model.fees.Invoice

/** Outcome of a receipt request shown inline under the payments. */
sealed interface ReceiptProblem {
    data object NotReady : ReceiptProblem

    data class Failed(val error: AppError) : ReceiptProblem
}

@Immutable
data class InvoiceDetailUiState(
    val isLoading: Boolean = true,
    val error: AppError? = null,
    val invoice: Invoice? = null,
    /** Branch fee settings arrive with the summary; null hides proof upload and online payment. */
    val summary: FeeSummary? = null,
    val receiptBusyId: String? = null,
    val receiptProblem: ReceiptProblem? = null,
    val isPayingOnline: Boolean = false,
    val payOnlineError: AppError? = null,
    val isDownloadingChallan: Boolean = false,
    val challanError: AppError? = null,
    /** One-shot: the route opens it in a viewer/browser and clears it. */
    val urlToOpen: String? = null,
) {
    val canUploadProof: Boolean get() = invoice?.isPayable == true && summary?.proofUploadEnabled == true

    val canPayOnline: Boolean get() = invoice?.isPayable == true && summary?.onlineGatewayEnabled == true
}
