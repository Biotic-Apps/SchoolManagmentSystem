package com.schoolapp.feature.fees.staff.payments

import com.schoolapp.core.designsystem.money.MoneyFormat

enum class ActionIssue { REASON_TOO_SHORT, AMOUNT_REQUIRED, AMOUNT_INVALID, AMOUNT_OVER_PAYMENT, CASH_REQUIRED }

/** Pure rules shared by reverse, refund and close-day forms (mirror the API validators). */
object PaymentActionRules {
    /** The API requires 3–500 characters for a reverse / refund reason. */
    const val MIN_REASON = 3
    const val MAX_REASON = 500

    fun reason(text: String): Set<ActionIssue> =
        if (text.trim().length < MIN_REASON) setOf(ActionIssue.REASON_TOO_SHORT) else emptySet()

    fun refund(amountText: String, reason: String, paymentMinor: Long): Set<ActionIssue> = buildSet {
        val amount = MoneyFormat.parse(amountText)
        when {
            amountText.isBlank() -> add(ActionIssue.AMOUNT_REQUIRED)
            amount == null || amount <= 0L -> add(ActionIssue.AMOUNT_INVALID)
            amount > paymentMinor -> add(ActionIssue.AMOUNT_OVER_PAYMENT)
        }
        addAll(reason(reason))
    }

    /** Counted cash may be zero but must be a valid amount. */
    fun cashCounted(text: String): Long? = MoneyFormat.parse(text)?.takeIf { it >= 0 }
}
