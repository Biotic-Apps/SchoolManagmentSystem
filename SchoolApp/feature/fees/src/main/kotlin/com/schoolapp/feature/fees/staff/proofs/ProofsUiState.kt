package com.schoolapp.feature.fees.staff.proofs

import androidx.compose.runtime.Immutable
import com.schoolapp.core.common.result.AppError
import com.schoolapp.core.model.fees.PaymentProof

enum class ProofDecision { VERIFY, REJECT }

/** The open proof sheet: note (verify, optional) or reason (reject, required). */
@Immutable
data class ProofReview(
    val proof: PaymentProof,
    val decision: ProofDecision? = null,
    val text: String = "",
    val textMissing: Boolean = false,
    val isSaving: Boolean = false,
    val error: AppError? = null,
)

@Immutable
data class ProofsUiState(
    val isLoading: Boolean = true,
    val isRefreshing: Boolean = false,
    val error: AppError? = null,
    val proofs: List<PaymentProof> = emptyList(),
    val canApprove: Boolean = false,
    val review: ProofReview? = null,
    /** Last decision taken, shown as a confirmation line. */
    val lastDecision: ProofDecision? = null,
)
