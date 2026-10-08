package com.schoolapp.feature.fees.staff.payments

import androidx.compose.runtime.Immutable
import com.schoolapp.core.common.result.AppError
import com.schoolapp.core.model.fees.Payment
import com.schoolapp.core.model.fees.PaymentMethod

enum class PaymentAction { REFUND, REVERSE }

enum class PaymentNotice { REVERSAL_SENT, REFUND_SENT }

/** Open payment sheet: the menu, or the reverse / refund form. */
@Immutable
data class PaymentSheet(
    val payment: Payment,
    val action: PaymentAction? = null,
    val reason: String = "",
    val amount: String = "",
    val method: PaymentMethod = PaymentMethod.CASH,
    val issues: Set<ActionIssue> = emptySet(),
    val confirming: Boolean = false,
    val isSaving: Boolean = false,
    val isOpeningReceipt: Boolean = false,
    val error: AppError? = null,
)

@Immutable
data class PaymentActionsUiState(
    /** `fees.edit`: reverse (approval flow). */
    val canReverse: Boolean = false,
    /** `fees.add`: refund request (approval flow). */
    val canRefund: Boolean = false,
    val sheet: PaymentSheet? = null,
    val notice: PaymentNotice? = null,
    /** Receipt url to open once; cleared by [PaymentActionsViewModel.onUrlOpened]. */
    val openUrl: String? = null,
) {
    fun canAct(payment: Payment): Boolean = payment.isActive && (canReverse || canRefund)
}
