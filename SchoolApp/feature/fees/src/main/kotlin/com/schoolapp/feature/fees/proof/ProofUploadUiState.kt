package com.schoolapp.feature.fees.proof

import androidx.compose.runtime.Immutable
import com.schoolapp.core.common.result.AppError
import com.schoolapp.core.model.fees.Invoice
import com.schoolapp.core.model.fees.ProofMethod

/** A picked content Uri with what the system reported about it. */
data class PickedFile(val uri: String, val mime: String?, val name: String?)

@Immutable
data class ProofUploadUiState(
    val isLoading: Boolean = true,
    val loadError: AppError? = null,
    val invoice: Invoice? = null,
    val today: String = "",
    val amountText: String = "",
    val paidOn: String = "",
    val method: ProofMethod = ProofMethod.BANK,
    val reference: String = "",
    val file: PickedFile? = null,
    /** Shown only after the first submit attempt so the form does not start red. */
    val issues: Set<ProofIssue> = emptySet(),
    val isSubmitting: Boolean = false,
    val submitError: AppError? = null,
    val submitted: Boolean = false,
) {
    val draft: ProofDraft get() = ProofDraft(amountText, paidOn, reference, file?.mime, file != null)
}
