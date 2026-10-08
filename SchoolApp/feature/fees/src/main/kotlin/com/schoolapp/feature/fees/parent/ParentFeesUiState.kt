package com.schoolapp.feature.fees.parent

import androidx.compose.runtime.Immutable
import com.schoolapp.core.common.result.AppError
import com.schoolapp.core.model.fees.FeeSummary
import com.schoolapp.core.model.fees.Invoice
import com.schoolapp.core.model.fees.PaymentProof

@Immutable
data class ParentFeesUiState(
    val isLoading: Boolean = true,
    val isRefreshing: Boolean = false,
    val error: AppError? = null,
    val childId: String? = null,
    val childName: String? = null,
    val summary: FeeSummary? = null,
    val invoices: List<Invoice> = emptyList(),
    val proofs: List<PaymentProof> = emptyList(),
) {
    val currency: String get() = summary?.currency ?: invoices.firstOrNull()?.currency ?: DEFAULT_CURRENCY

    private companion object {
        const val DEFAULT_CURRENCY = "PKR"
    }
}
